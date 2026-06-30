export type Rider = {
  name: string;
  team: string;
  role: "climber" | "sprinter" | "GC" | "domestique";
  maxBid: number;
  desirabilityScore: number;
  budgetRiderPool?: boolean;
};

export const TOP_RIDERS: Rider[] = [
  // Team Visma | Lease a Bike
  {
    name: "VINGEGAARD Jonas",
    team: "Team Visma | Lease a Bike",
    role: "GC",
    maxBid: 9500000,
    desirabilityScore: 100,
  },

  // UAE Team Emirates XRG
  {
    name: "YATES Adam",
    team: "UAE Team Emirates XRG",
    role: "GC",
    maxBid: 6000000,
    desirabilityScore: 75,
  },
  {
    name: "NARVÁEZ Jhonatan",
    team: "UAE Team Emirates XRG",
    role: "GC",
    maxBid: 4000000,
    desirabilityScore: 60,
  },

  // Netcompany-Ineos Cycling
  {
    name: "BERNAL Egan",
    team: "Netcompany-Ineos Cycling",
    role: "GC",
    maxBid: 5500000,
    desirabilityScore: 70,
  },
  {
    name: "GANNA Filippo",
    team: "Netcompany-Ineos Cycling",
    role: "domestique",
    maxBid: 4000000,
    desirabilityScore: 55,
  },
  {
    name: "ARENSMAN Thymen",
    team: "Netcompany-Ineos Cycling",
    role: "GC",
    maxBid: 2500000,
    desirabilityScore: 45,
  },

  // Lidl-Trek
  {
    name: "MILAN Jonathan",
    team: "Lidl-Trek",
    role: "sprinter",
    maxBid: 5000000,
    desirabilityScore: 72,
  },
  {
    name: "CICCONE Giulio",
    team: "Lidl-Trek",
    role: "climber",
    maxBid: 3000000,
    desirabilityScore: 55,
  },

  // Red Bull-BORA-hansgrohe
  {
    name: "HINDLEY Jai",
    team: "Red Bull-BORA-hansgrohe",
    role: "GC",
    maxBid: 4500000,
    desirabilityScore: 65,
  },

  // Team Jayco AlUla
  {
    name: "O'CONNOR Ben",
    team: "Team Jayco AlUla",
    role: "GC",
    maxBid: 4000000,
    desirabilityScore: 62,
  },

  // Lotto-Intermarché
  {
    name: "VAN EETVELT Lennert",
    team: "Lotto-Intermarché",
    role: "GC",
    maxBid: 4000000,
    desirabilityScore: 65,
  },

  // Decathlon CMA CGM Team
  {
    name: "GALL Felix",
    team: "Decathlon CMA CGM Team",
    role: "GC",
    maxBid: 3500000,
    desirabilityScore: 58,
  },

  // Alpecin-Premier Tech
  {
    name: "GROVES Kaden",
    team: "Alpecin-Premier Tech",
    role: "sprinter",
    maxBid: 3500000,
    desirabilityScore: 58,
  },

  // Movistar Team
  {
    name: "MAS Enric",
    team: "Movistar Team",
    role: "GC",
    maxBid: 3000000,
    desirabilityScore: 50,
  },

  // Groupama-FDJ United
  {
    name: "GERMANI Lorenzo",
    team: "Groupama-FDJ United",
    role: "climber",
    maxBid: 3000000,
    desirabilityScore: 52,
  },

  // Unibet Rose Rockets
  {
    name: "GROENEWEGEN Dylan",
    team: "Unibet Rose Rockets",
    role: "sprinter",
    maxBid: 3000000,
    desirabilityScore: 50,
  },
];

export const BUDGET_RIDERS: Rider[] = [
  // UAE Team Emirates XRG
  {
    name: "BJERG Mikkel",
    team: "UAE Team Emirates XRG",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 30,
    budgetRiderPool: true,
  },
  {
    name: "SOLER Marc",
    team: "UAE Team Emirates XRG",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 32,
    budgetRiderPool: true,
  },
  {
    name: "VINE Jay",
    team: "UAE Team Emirates XRG",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },
  {
    name: "CHRISTEN Jan",
    team: "UAE Team Emirates XRG",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 26,
    budgetRiderPool: true,
  },
  {
    name: "ARRIETA Igor",
    team: "UAE Team Emirates XRG",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 24,
    budgetRiderPool: true,
  },
  {
    name: "MORGADO António",
    team: "UAE Team Emirates XRG",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 20,
    budgetRiderPool: true,
  },

  // Team Visma | Lease a Bike
  {
    name: "KUSS Sepp",
    team: "Team Visma | Lease a Bike",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 35,
    budgetRiderPool: true,
  },
  {
    name: "CAMPENAERTS Victor",
    team: "Team Visma | Lease a Bike",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },
  {
    name: "KELDERMAN Wilco",
    team: "Team Visma | Lease a Bike",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 26,
    budgetRiderPool: true,
  },
  {
    name: "PIGANZOLI Davide",
    team: "Team Visma | Lease a Bike",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 20,
    budgetRiderPool: true,
  },

  // Netcompany-Ineos Cycling
  {
    name: "SHEFFIELD Magnus",
    team: "Netcompany-Ineos Cycling",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 30,
    budgetRiderPool: true,
  },
  {
    name: "HAIG Jack",
    team: "Netcompany-Ineos Cycling",
    role: "GC",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },
  {
    name: "SWIFT Connor",
    team: "Netcompany-Ineos Cycling",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 22,
    budgetRiderPool: true,
  },
  {
    name: "TURNER Ben",
    team: "Netcompany-Ineos Cycling",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 20,
    budgetRiderPool: true,
  },

  // Red Bull-BORA-hansgrohe
  {
    name: "VLASOV Aleksandr",
    team: "Red Bull-BORA-hansgrohe",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 32,
    budgetRiderPool: true,
  },
  {
    name: "ALEOTTI Giovanni",
    team: "Red Bull-BORA-hansgrohe",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 30,
    budgetRiderPool: true,
  },
  {
    name: "PELLIZZARI Giulio",
    team: "Red Bull-BORA-hansgrohe",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 25,
    budgetRiderPool: true,
  },

  // Lidl-Trek
  {
    name: "CONSONNI Simone",
    team: "Lidl-Trek",
    role: "sprinter",
    maxBid: 0,
    desirabilityScore: 25,
    budgetRiderPool: true,
  },
  {
    name: "AERTS Toon",
    team: "Lidl-Trek",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 22,
    budgetRiderPool: true,
  },

  // Movistar Team
  {
    name: "RUBIO Einer",
    team: "Movistar Team",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 30,
    budgetRiderPool: true,
  },
  {
    name: "GARCIA CORTINA Ivan",
    team: "Movistar Team",
    role: "sprinter",
    maxBid: 0,
    desirabilityScore: 26,
    budgetRiderPool: true,
  },
  {
    name: "LOPEZ Juan Pedro",
    team: "Movistar Team",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 24,
    budgetRiderPool: true,
  },

  // Bahrain Victorious
  {
    name: "BUITRAGO Santiago",
    team: "Bahrain Victorious",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 32,
    budgetRiderPool: true,
  },
  {
    name: "CARUSO Damiano",
    team: "Bahrain Victorious",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 26,
    budgetRiderPool: true,
  },
  {
    name: "SEGAERT Alec",
    team: "Bahrain Victorious",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },

  // Team Jayco AlUla
  {
    name: "BOUWMAN Koen",
    team: "Team Jayco AlUla",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 24,
    budgetRiderPool: true,
  },
  {
    name: "ENGELHARDT Felix",
    team: "Team Jayco AlUla",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 22,
    budgetRiderPool: true,
  },

  // Soudal Quick-Step
  {
    name: "GAROFOLI Gianmarco",
    team: "Soudal Quick-Step",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },
  {
    name: "MAGNIER Paul",
    team: "Soudal Quick-Step",
    role: "sprinter",
    maxBid: 0,
    desirabilityScore: 26,
    budgetRiderPool: true,
  },
  {
    name: "ZANA Filippo",
    team: "Soudal Quick-Step",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 30,
    budgetRiderPool: true,
  },

  // Decathlon CMA CGM Team
  {
    name: "STAUNE-MITTET Johannes",
    team: "Decathlon CMA CGM Team",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },

  // Groupama-FDJ United
  {
    name: "CAVAGNA Remi",
    team: "Groupama-FDJ United",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 22,
    budgetRiderPool: true,
  },

  // Lotto-Intermarché
  {
    name: "SLOCK Liam",
    team: "Lotto-Intermarché",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 20,
    budgetRiderPool: true,
  },

  // Unibet Rose Rockets
  {
    name: "POELS Wout",
    team: "Unibet Rose Rockets",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },

  // EF Education-EasyPost
  {
    name: "CEPEDA Jefferson Alexander",
    team: "EF Education-EasyPost",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 28,
    budgetRiderPool: true,
  },
  {
    name: "BATTISTELLA Samuele",
    team: "EF Education-EasyPost",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 24,
    budgetRiderPool: true,
  },

  // XDS Astana Team
  {
    name: "BETTIOL Alberto",
    team: "XDS Astana Team",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 30,
    budgetRiderPool: true,
  },
  {
    name: "BALLERINI Davide",
    team: "XDS Astana Team",
    role: "sprinter",
    maxBid: 0,
    desirabilityScore: 26,
    budgetRiderPool: true,
  },
  {
    name: "ULISSI Diego",
    team: "XDS Astana Team",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 24,
    budgetRiderPool: true,
  },

  // NSN Cycling Team
  {
    name: "HIRT Jan",
    team: "NSN Cycling Team",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 26,
    budgetRiderPool: true,
  },

  // Uno-X Mobility
  {
    name: "LEKNESSUND Andreas",
    team: "Uno-X Mobility",
    role: "climber",
    maxBid: 0,
    desirabilityScore: 30,
    budgetRiderPool: true,
  },

  // Team Picnic PostNL
  {
    name: "HAMILTON Chris",
    team: "Team Picnic PostNL",
    role: "domestique",
    maxBid: 0,
    desirabilityScore: 20,
    budgetRiderPool: true,
  },
];

export const ALL_RIDERS: Rider[] = TOP_RIDERS.concat(BUDGET_RIDERS);

export const TOP_TOP_RIDERS: Rider[] = TOP_RIDERS.filter(
  (rider) => rider.desirabilityScore > 75,
);