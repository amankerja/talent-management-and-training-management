export const DB_NAME = 'sqlite:workforce_os.db';

export const SCHEMA_SQL = [
  // 1. System metadata table for versioning & seed tracking
  `CREATE TABLE IF NOT EXISTS system_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 2. Employees Table
  `CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    nip TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatarUrl TEXT,
    department TEXT NOT NULL,
    jobTitle TEXT NOT NULL,
    level TEXT NOT NULL,
    grade TEXT NOT NULL,
    education TEXT NOT NULL,
    tenureYears REAL NOT NULL,
    joinDate TEXT NOT NULL,
    birthYear INTEGER NOT NULL,
    employmentType TEXT NOT NULL,
    contractEndDate TEXT,
    managerName TEXT,
    managerId TEXT,
    directReportsCount INTEGER DEFAULT 0,
    performanceRating TEXT NOT NULL,
    potentialRating TEXT NOT NULL,
    nineBoxGrid INTEGER NOT NULL,
    trainings_json TEXT NOT NULL DEFAULT '{}',
    radar_json TEXT NOT NULL DEFAULT '{}',
    careerPaths_json TEXT NOT NULL DEFAULT '[]',
    isKeyTalent INTEGER DEFAULT 0,
    isSuccessorReady INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 3. Training Modules Table
  `CREATE TABLE IF NOT EXISTS training_modules (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    durationHours INTEGER NOT NULL,
    provider TEXT NOT NULL,
    description TEXT NOT NULL,
    mandatoryForRoles_json TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 4. TNA Rules Table
  `CREATE TABLE IF NOT EXISTS tna_rules (
    id TEXT PRIMARY KEY,
    rule_key TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    level TEXT NOT NULL,
    minEdu TEXT NOT NULL,
    minTenureYears REAL NOT NULL,
    requiredTrainingIds_json TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 5. Critical Positions Table
  `CREATE TABLE IF NOT EXISTS critical_positions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    currentHolder TEXT NOT NULL,
    currentHolderId TEXT NOT NULL,
    riskLevel TEXT NOT NULL,
    businessImpact TEXT NOT NULL,
    retirementYearsRemaining INTEGER NOT NULL,
    successors_json TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 6. Manpower Planning Table
  `CREATE TABLE IF NOT EXISTS mpp_plans (
    department TEXT PRIMARY KEY,
    currentHeadcount INTEGER NOT NULL,
    projectedTurnover INTEGER NOT NULL,
    projectedRetirements INTEGER NOT NULL,
    projectedSupply INTEGER NOT NULL,
    requiredDemand INTEGER NOT NULL,
    gap INTEGER NOT NULL,
    interventions_json TEXT NOT NULL DEFAULT '{}',
    estimatedBudgetMillionIDR REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 7. Job Positions & Level Management Table
  `CREATE TABLE IF NOT EXISTS job_positions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    level TEXT NOT NULL,
    grade TEXT NOT NULL,
    reportsToPositionId TEXT,
    reportsToTitle TEXT,
    reportsToLevel TEXT,
    targetHeadcount INTEGER NOT NULL DEFAULT 1,
    minEdu TEXT,
    minTenureYears REAL DEFAULT 0,
    isCritical INTEGER DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 8. Competencies Master Table
  `CREATE TABLE IF NOT EXISTS competencies (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    levels_json TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 9. Position Competency Requirements Table
  `CREATE TABLE IF NOT EXISTS position_competencies (
    id TEXT PRIMARY KEY,
    positionId TEXT NOT NULL,
    positionTitle TEXT NOT NULL,
    department TEXT NOT NULL,
    jobLevel TEXT NOT NULL,
    requirements_json TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 10. Employee Competency Assessments Table
  `CREATE TABLE IF NOT EXISTS employee_assessments (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    department TEXT NOT NULL,
    jobTitle TEXT NOT NULL,
    assessedDate TEXT NOT NULL,
    scores_json TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 11. Workforce Movements History Table
  `CREATE TABLE IF NOT EXISTS workforce_movements (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    type TEXT NOT NULL,
    fromPosition TEXT NOT NULL,
    toPosition TEXT NOT NULL,
    fromDepartment TEXT NOT NULL,
    toDepartment TEXT NOT NULL,
    fromGrade TEXT,
    toGrade TEXT,
    effectiveDate TEXT NOT NULL,
    skNumber TEXT,
    reason TEXT,
    approvedBy TEXT,
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 12. Annual Training Plans (ATP) Table
  `CREATE TABLE IF NOT EXISTS annual_training_plans (
    id TEXT PRIMARY KEY,
    moduleCode TEXT NOT NULL,
    moduleName TEXT NOT NULL,
    category TEXT NOT NULL,
    department TEXT NOT NULL,
    plannedMonth TEXT NOT NULL,
    targetParticipants INTEGER NOT NULL,
    actualParticipants INTEGER DEFAULT 0,
    estimatedBudgetMillionIDR REAL NOT NULL,
    actualCostMillionIDR REAL,
    status TEXT NOT NULL DEFAULT 'Draft',
    trainerId TEXT,
    trainerName TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 13. Master Trainers Table
  `CREATE TABLE IF NOT EXISTS trainers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    type TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specializations_json TEXT NOT NULL DEFAULT '[]',
    rating REAL DEFAULT 5.0,
    ratePerDayMillionIDR REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 14. Training Events & Batches Table
  `CREATE TABLE IF NOT EXISTS training_events (
    id TEXT PRIMARY KEY,
    moduleId TEXT NOT NULL,
    moduleCode TEXT NOT NULL,
    moduleName TEXT NOT NULL,
    batchNumber INTEGER NOT NULL,
    trainerId TEXT NOT NULL,
    trainerName TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    location TEXT NOT NULL,
    maxParticipants INTEGER NOT NULL,
    attendees_json TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'Upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 15. Detailed IDP 70:20:10 Table
  `CREATE TABLE IF NOT EXISTS detailed_idps (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    employeeName TEXT NOT NULL,
    targetPosition TEXT NOT NULL,
    periodYear INTEGER NOT NULL,
    strategicFocus TEXT,
    experience70_json TEXT NOT NULL DEFAULT '[]',
    exposure20_json TEXT NOT NULL DEFAULT '[]',
    education10_json TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 16. Career Architecture Nodes Table
  `CREATE TABLE IF NOT EXISTS career_nodes (
    id TEXT PRIMARY KEY,
    trackId TEXT NOT NULL,
    trackName TEXT NOT NULL,
    department TEXT NOT NULL,
    title TEXT NOT NULL,
    level TEXT NOT NULL,
    grade TEXT NOT NULL,
    node_order INTEGER NOT NULL,
    educationReq TEXT NOT NULL,
    minTenureYears REAL NOT NULL,
    requiredCompetencies_json TEXT NOT NULL DEFAULT '[]',
    requiredTrainings_json TEXT NOT NULL DEFAULT '[]',
    leadershipMinScore REAL DEFAULT 70,
    performanceMinRating TEXT DEFAULT 'High',
    salaryRange_json TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  // 17. Audit Trail / Activity Log Table
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    actorName TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );`
];
