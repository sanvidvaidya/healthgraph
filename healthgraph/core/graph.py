"""
HealthGraph Relationship Graph Engine.

Builds a directed knowledge graph of healthcare resources and links using NetworkX.
Provides topology analysis, patient ego-networks, and interactive graph serialization.
"""

from typing import Dict, Any, List, Optional, Set
import networkx as nx
from healthgraph.core.resolver import ReferenceResolver, ResolvedReference


class GraphEngine:
    """Manages the network topology of connected FHIR resources."""

    def __init__(self, resolver: ReferenceResolver):
        self.resolver = resolver
        self.graph = nx.MultiDiGraph()
        self.rebuild_graph()

    def rebuild_graph(self) -> None:
        """Constructs NetworkX directed graph from resolver store and references."""
        self.graph.clear()

        # 1. Add all resources as nodes
        for key, res in self.resolver._store.items():
            res_type = res.get("resourceType", "Resource")
            res_id = res.get("id", "")
            title = self.resolver._get_title(res)
            status = res.get("status")
            if not status and res.get("clinicalStatus"):
                status = res["clinicalStatus"].get("text", "active")

            date = (
                res.get("effectiveDateTime") or
                res.get("performedDateTime") or
                res.get("authoredOn") or
                res.get("onsetDateTime") or
                (res.get("period", {}).get("start") if isinstance(res.get("period"), dict) else None) or
                res.get("birthDate")
            )

            patient_id = None
            subj = res.get("subject")
            if subj and isinstance(subj, dict):
                ref = subj.get("reference", "")
                if "Patient/" in ref:
                    patient_id = ref.split("Patient/")[1]
            elif res_type == "Patient":
                patient_id = res_id

            self.graph.add_node(
                key,
                id=key,
                resourceId=res_id,
                resourceType=res_type,
                title=title,
                status=status or "recorded",
                date=date,
                patientId=patient_id
            )

        # 2. Add edges for forward links
        for src_key, links in self.resolver._forward_links.items():
            for link in links:
                tgt_key = link.target_key
                # If target is not in store (dangling), we add a ghost node to make dangling visible
                if tgt_key not in self.graph:
                    self.graph.add_node(
                        tgt_key,
                        id=tgt_key,
                        resourceId=link.target_id,
                        resourceType=link.target_type,
                        title=link.display or f"Unresolved {link.target_type}",
                        status="unresolved",
                        date=None,
                        patientId=None,
                        isDangling=True
                    )

                # Assign human-readable edge label based on path
                edge_label = self._humanize_edge(link.path)

                self.graph.add_edge(
                    src_key,
                    tgt_key,
                    key=link.path,
                    path=link.path,
                    label=edge_label,
                    isResolved=link.is_resolved
                )

    def _humanize_edge(self, path: str) -> str:
        """Translates FHIR reference paths into concise clinical relationship predicates."""
        p = path.lower()
        if "subject" in p:
            return "subject"
        if "encounter" in p:
            return "context"
        if "performer" in p or "actor" in p:
            return "performer"
        if "requester" in p:
            return "prescriber"
        if "diagnosis" in p or "condition" in p:
            return "diagnosis"
        if "result" in p:
            return "result"
        if "serviceprovider" in p or "managingorganization" in p:
            return "organization"
        if "generalpractitioner" in p:
            return "primary care"
        if "reasonreference" in p:
            return "justification"
        return "references"

    def get_full_graph_data(self) -> Dict[str, Any]:
        """Serializes complete graph for visualization."""
        nodes = []
        for n, data in self.graph.nodes(data=True):
            in_deg = self.graph.in_degree(n)
            out_deg = self.graph.out_degree(n)
            node_dict = dict(data)
            node_dict["degree"] = in_deg + out_deg
            node_dict["inDegree"] = in_deg
            node_dict["outDegree"] = out_deg
            nodes.append(node_dict)

        edges = []
        for u, v, k, data in self.graph.edges(data=True, keys=True):
            edge_dict = dict(data)
            edge_dict["source"] = u
            edge_dict["target"] = v
            edges.append(edge_dict)

        return {
            "nodes": nodes,
            "edges": edges,
            "metrics": self.get_metrics()
        }

    def get_patient_subgraph(self, patient_id: str) -> Dict[str, Any]:
        """Extracts the ego-network directly or indirectly tied to a specific patient."""
        patient_key = f"Patient/{patient_id}"
        if patient_key not in self.graph:
            return {"nodes": [], "edges": [], "metrics": {"totalNodes": 0, "totalEdges": 0}}

        # Find all nodes that explicitly carry this patientId or are within 2 hops
        relevant_nodes: Set[str] = {patient_key}

        for n, data in self.graph.nodes(data=True):
            if data.get("patientId") == patient_id:
                relevant_nodes.add(n)

        # Expand 1 hop outwards for practitioners and organizations referenced by these nodes
        expanded_nodes = set(relevant_nodes)
        for n in relevant_nodes:
            for neighbor in self.graph.successors(n):
                expanded_nodes.add(neighbor)
            for predecessor in self.graph.predecessors(n):
                expanded_nodes.add(predecessor)

        subg = self.graph.subgraph(expanded_nodes)

        nodes = []
        for n, data in subg.nodes(data=True):
            node_dict = dict(data)
            node_dict["degree"] = subg.degree(n)
            nodes.append(node_dict)

        edges = []
        for u, v, k, data in subg.edges(data=True, keys=True):
            edge_dict = dict(data)
            edge_dict["source"] = u
            edge_dict["target"] = v
            edges.append(edge_dict)

        return {
            "patientId": patient_id,
            "nodes": nodes,
            "edges": edges,
            "nodeCount": len(nodes),
            "edgeCount": len(edges)
        }

    def get_resource_neighborhood(self, resource_type: str, resource_id: str) -> Dict[str, Any]:
        """Returns immediate 1-hop in-bound and out-bound neighbors of a resource."""
        key = f"{resource_type}/{resource_id}"
        if key not in self.graph:
            return {"source": key, "inbound": [], "outbound": []}

        outbound = []
        for _, tgt, data in self.graph.out_edges(key, data=True):
            tgt_data = self.graph.nodes.get(tgt, {})
            outbound.append({
                "targetKey": tgt,
                "targetType": tgt_data.get("resourceType"),
                "targetTitle": tgt_data.get("title"),
                "relationship": data.get("label"),
                "isResolved": data.get("isResolved", True)
            })

        inbound = []
        for src, _, data in self.graph.in_edges(key, data=True):
            src_data = self.graph.nodes.get(src, {})
            inbound.append({
                "sourceKey": src,
                "sourceType": src_data.get("resourceType"),
                "sourceTitle": src_data.get("title"),
                "relationship": data.get("label"),
                "isResolved": data.get("isResolved", True)
            })

        return {
            "resourceKey": key,
            "inbound": inbound,
            "outbound": outbound
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Computes topological indicators for the healthcare knowledge network."""
        n_nodes = self.graph.number_of_nodes()
        n_edges = self.graph.number_of_edges()

        # Degree centrality top nodes
        degrees = sorted(self.graph.degree(), key=lambda x: x[1], reverse=True)[:5]
        top_hubs = [{"node": n, "degree": deg, "type": self.graph.nodes[n].get("resourceType"), "title": self.graph.nodes[n].get("title")} for n, deg in degrees]

        return {
            "totalNodes": n_nodes,
            "totalEdges": n_edges,
            "topHubs": top_hubs,
            "density": round(nx.density(self.graph), 4) if n_nodes > 1 else 0
        }
