"""Direct road emissions from retiring MOL EURO 4 diesel cars for used BEVs."""

# MOL Energetska bilanca 2024, Table 16, passenger cars, diesel, 30 June 2023.
DIESEL_FLEET_LIMIT = 14_753
# Borzen JP SUB-EV26 (2026), published benchmark for eligible used EVs up to €45,000.
DIESEL_SUBSIDY_EUR = 3_000
# SURS 2282005S, 2024, national diesel M1 average for vehicles aged 15–19.
# Includes Slovenian and foreign roads. Same mileage for diesel and BEV.
ANNUAL_KM = 12_907.2287416413
# EMEP/EEA 2026 Tables 3-17 and 3-18, medium diesel EURO 4, grams per km.
NOX_EXHAUST_G_KM = 0.599
PM_EXHAUST_G_KM = 0.0383
# Energetska bilanca MOL 2024, tables 30 and 31, 2024 "promet" row.
# The report lists 187.1 tonnes for each size class.
MOL_TRANSPORT_PM25_KG = 187_100
MOL_TRANSPORT_PM10_KG = 187_100


def _wear_savings_g_km(size_fractions: tuple[float, float, float]) -> float:
    # EMEP/EEA 2025 Tables 3-4 to 3-9. Medium ICE minus medium BEV TSP
    # (tyre, brake, road). Apply the <40 km/h mean trip speed wear factors.
    tsp_deltas = (0.0107 - 0.0116, 0.0142 - 0.0030, 0.0150 - 0.0169)
    speed_factors = (1.39, 1.67, 1.0)
    return sum(
        delta * correction * fraction
        for delta, correction, fraction in zip(tsp_deltas, speed_factors, size_fractions)
    )


PM25_WEAR_G_KM = _wear_savings_g_km((0.42, 0.39, 0.27))
PM10_WEAR_G_KM = _wear_savings_g_km((0.60, 0.98, 0.50))


def annual_avoided_emissions(replacements: int) -> dict[str, float]:
    """Mass avoided over one full year of operation after replacement, in kg."""
    km_in_thousands = replacements * ANNUAL_KM / 1_000
    return {
        "nox_kg": km_in_thousands * NOX_EXHAUST_G_KM,
        "pm25_kg": km_in_thousands * (PM_EXHAUST_G_KM + PM25_WEAR_G_KM),
        "pm10_kg": km_in_thousands * (PM_EXHAUST_G_KM + PM10_WEAR_G_KM),
    }
