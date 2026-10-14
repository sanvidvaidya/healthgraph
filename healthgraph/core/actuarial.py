"""
HealthGraph Value-Based Care (VBC) Actuarial Shared Savings & Risk Contract Sandbox Engine.
Simulates:
1. CMS MSSP (Medicare Shared Savings Program) Enhanced & Basic tracks (2-sided risk)
2. Medicare Advantage (MA) Capitation with Risk Corridors
3. Impact of HCC coding recapture (+RAF score), HEDIS Star ratings, and avoided ED utilization
4. Direct EBITDA / Shared Savings distribution and downside penalty avoidance
"""

from typing import Dict, Any, List


class ActuarialEngine:
    """Computes actuarial performance under two-sided value-based risk contracts."""

    CONTRACT_MODELS = {
        "mssp_enhanced": {
            "name": "CMS MSSP Enhanced (Two-Sided Track)",
            "shared_savings_rate": 0.75,
            "downside_loss_rate": 0.40,
            "min_savings_rate_threshold": 0.02,  # 2% MSR
            "quality_performance_cap": 1.0,
            "description": "Maximum 75% shared savings upside with 40% downside risk corridor under CMS Medicare Shared Savings Program."
        },
        "mssp_basic_e": {
            "name": "CMS MSSP Basic (Level E)",
            "shared_savings_rate": 0.50,
            "downside_loss_rate": 0.30,
            "min_savings_rate_threshold": 0.02,
            "quality_performance_cap": 1.0,
            "description": "50% shared savings with 30% downside risk."
        },
        "ma_full_risk": {
            "name": "Medicare Advantage Full Capitation (85% MLR Target)",
            "shared_savings_rate": 0.85,
            "downside_loss_rate": 0.85,
            "min_savings_rate_threshold": 0.01,
            "quality_performance_cap": 1.05,  # Star bonus
            "description": "Full risk delegation from Medicare Advantage health plan with 5-star quality bonus."
        }
    }

    @classmethod
    def simulate_contract(
        cls,
        contract_type: str = "mssp_enhanced",
        attributed_lives: int = 10000,
        benchmark_pmpm: float = 850.0,
        hcc_recapture_lift: float = 0.08,  # +0.08 RAF lift
        hedis_star_rating: float = 4.5,    # 3.0 to 5.0 stars
        ed_reduction_pct: float = 0.12     # 12% avoidable ED reduction
    ) -> Dict[str, Any]:
        """
        Calculates exact financial flows, shared savings payouts, and penalty avoidance.
        """
        model = cls.CONTRACT_MODELS.get(contract_type, cls.CONTRACT_MODELS["mssp_enhanced"])

        # 1. Total Baseline Benchmark Spending
        annual_benchmark = attributed_lives * benchmark_pmpm * 12

        # 2. Risk-Adjusted Revenue Factor
        # In MA/MSSP, benchmark spending adjusts by RAF score.
        # Recapturing un-coded chronic conditions (e.g., T2D with CKD) increases the risk-adjusted benchmark.
        risk_adjustment_multiplier = 1.0 + hcc_recapture_lift
        adjusted_benchmark = annual_benchmark * risk_adjustment_multiplier

        # 3. Medical Expense Reductions from Clinical Intervention
        # ED avoidance saves ~ $1,850 per avoided visit (assumed 320 ED visits per 1,000 lives baseline)
        baseline_ed_visits = (attributed_lives / 1000.0) * 320.0
        avoided_ed_visits = baseline_ed_visits * ed_reduction_pct
        ed_savings = avoided_ed_visits * 1850.0

        # High-risk medication adherence (PDC > 80%) prevents chronic inpatient admissions
        med_adherence_savings = attributed_lives * 14.50 * 12  # $14.50 PMPM saved in inpatient admissions

        total_medical_cost_reduction = ed_savings + med_adherence_savings

        # 4. Actual Managed Spending
        actual_spending = annual_benchmark - total_medical_cost_reduction

        # 5. Gross Savings (Adjusted Benchmark - Actual Spending)
        gross_savings = adjusted_benchmark - actual_spending
        savings_percentage = gross_savings / adjusted_benchmark

        # 6. Quality Multiplier (based on HEDIS Star Rating)
        # CMS scores: < 3.0 stars = 0% payout, 4.0 stars = 90% payout, 4.5+ stars = 100% payout
        if hedis_star_rating >= 4.5:
            quality_multiplier = 1.0
        elif hedis_star_rating >= 4.0:
            quality_multiplier = 0.90
        elif hedis_star_rating >= 3.5:
            quality_multiplier = 0.75
        else:
            quality_multiplier = 0.50

        # 7. Net Shared Savings Payout
        if savings_percentage >= model["min_savings_rate_threshold"]:
            net_shared_savings = gross_savings * model["shared_savings_rate"] * quality_multiplier
            penalty_incurred = 0.0
        elif gross_savings < 0:
            # Loss scenario
            net_shared_savings = 0.0
            penalty_incurred = abs(gross_savings) * model["downside_loss_rate"]
        else:
            # Within corridor below MSR
            net_shared_savings = 0.0
            penalty_incurred = 0.0

        # Downside Penalty Avoided by achieving positive savings
        potential_downside_penalty = (annual_benchmark * 0.05) * model["downside_loss_rate"]
        penalty_avoided = potential_downside_penalty if net_shared_savings > 0 else 0.0

        # Daily Cost of Inaction
        daily_cost_of_inaction = (net_shared_savings + penalty_avoided) / 365.0

        # High opportunity patient attribution list
        high_opp_patients = [
            {
                "patientId": "PAT-VANCE-01",
                "name": "Harold Vance",
                "age": 58,
                "rafLiftOpportunity": "+0.38 RAF",
                "capitationValue": "$3,876/yr",
                "unclosedGaps": ["CMS-HCC V28 T2D with CKD 3b Recapture", "HEDIS Statin Adherence (SUPD)"],
                "status": "ACTIONABLE"
            },
            {
                "patientId": "PAT-THORNE-02",
                "name": "Arthur Thorne",
                "age": 64,
                "rafLiftOpportunity": "+0.44 RAF",
                "capitationValue": "$4,488/yr",
                "unclosedGaps": ["CMS-HCC Post-Infarction Cardiomyopathy", "Cardiology Post-CABG Transition (TCM)"],
                "status": "ACTIONABLE"
            },
            {
                "patientId": "PAT-RIVERA-03",
                "name": "Elena Rivera",
                "age": 42,
                "rafLiftOpportunity": "+0.18 RAF",
                "capitationValue": "$1,836/yr",
                "unclosedGaps": ["Hypertension Staging Reconciliation", "Cervical & Breast Cancer Screening Gap"],
                "status": "ACTIONABLE"
            }
        ]

        return {
            "contract": model,
            "inputs": {
                "attributedLives": attributed_lives,
                "benchmarkPmpm": benchmark_pmpm,
                "hccRecaptureLift": hcc_recapture_lift,
                "hedisStarRating": hedis_star_rating,
                "edReductionPct": ed_reduction_pct
            },
            "financials": {
                "annualBenchmark": round(annual_benchmark, 2),
                "adjustedBenchmark": round(adjusted_benchmark, 2),
                "actualSpending": round(actual_spending, 2),
                "grossSavings": round(gross_savings, 2),
                "savingsPercentage": round(savings_percentage * 100, 2),
                "qualityMultiplier": quality_multiplier,
                "netSharedSavingsPayout": round(net_shared_savings, 2),
                "penaltyIncurred": round(penalty_incurred, 2),
                "downsidePenaltyAvoided": round(penalty_avoided, 2),
                "dailyCostOfInaction": round(daily_cost_of_inaction, 2)
            },
            "highOpportunityPatients": high_opp_patients
        }
