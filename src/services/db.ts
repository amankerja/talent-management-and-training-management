import Database from '@tauri-apps/plugin-sql';
import { 
  Employee, 
  TrainingModule, 
  TNARule, 
  CriticalPosition, 
  ManpowerDeptPlan, 
  JobPosition,
  Department, 
  JobLevel,
  CompetencyItem,
  PositionCompetencyRequirement,
  EmployeeCompetencyAssessment,
  WorkforceMovement,
  AnnualTrainingPlanItem,
  Trainer,
  TrainingEvent,
  DetailedIDP,
  CareerNode
} from '../types';
import { DB_NAME, SCHEMA_SQL } from './schema';
import { runDatabaseSeeder } from './seeder';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_TRAINING_MODULES, 
  INITIAL_TNA_RULES, 
  CRITICAL_POSITIONS, 
  INITIAL_MPP_DATA,
  INITIAL_JOB_POSITIONS,
  INITIAL_COMPETENCIES,
  INITIAL_POSITION_COMPETENCIES,
  INITIAL_WORKFORCE_MOVEMENTS,
  INITIAL_ANNUAL_TRAINING_PLANS,
  INITIAL_TRAINERS,
  INITIAL_TRAINING_EVENTS,
  INITIAL_DETAILED_IDPS,
  INITIAL_CAREER_NODES
} from '../data/mockData';

let dbInstance: Database | null = null;
let isNativeSqlAvailable = false;

/**
 * Initializes SQLite database connection, runs table schema DDL, and runs initial seeders.
 */
export async function initializeDatabase(): Promise<{ mode: 'sqlite' | 'localStorage'; isSeeded: boolean }> {
  try {
    // Check if running inside Tauri environment
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      dbInstance = await Database.load(DB_NAME);
      isNativeSqlAvailable = true;

      // 1. Run migrations / schema DDL
      for (const query of SCHEMA_SQL) {
        await dbInstance.execute(query);
      }

      // 2. Run Seeder
      const { seeded } = await runDatabaseSeeder(dbInstance);

      console.log(`[DB Service] Native SQLite Initialized (${DB_NAME}). Seeded: ${seeded}`);
      return { mode: 'sqlite', isSeeded: seeded };
    } else {
      console.warn('[DB Service] Tauri runtime not detected. Operating in LocalStorage fallback mode.');
      isNativeSqlAvailable = false;
      return { mode: 'localStorage', isSeeded: true };
    }
  } catch (error) {
    console.error('[DB Service] Failed to initialize SQLite. Falling back to LocalStorage:', error);
    isNativeSqlAvailable = false;
    return { mode: 'localStorage', isSeeded: false };
  }
}

/**
 * Returns whether native SQLite is active.
 */
export function isUsingSQLite(): boolean {
  return isNativeSqlAvailable && dbInstance !== null;
}

// -------------------------------------------------------------
// 1. EMPLOYEE OPERATIONS
// -------------------------------------------------------------

export async function fetchEmployees(): Promise<Employee[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM employees ORDER BY name ASC');
    return rows.map((r) => ({
      id: r.id,
      nip: r.nip,
      name: r.name,
      email: r.email,
      avatarUrl: r.avatarUrl,
      department: r.department,
      jobTitle: r.jobTitle,
      level: r.level,
      grade: r.grade,
      education: r.education,
      tenureYears: Number(r.tenureYears),
      joinDate: r.joinDate,
      birthYear: Number(r.birthYear),
      employmentType: r.employmentType,
      contractEndDate: r.contractEndDate || undefined,
      managerName: r.managerName || undefined,
      managerId: r.managerId || undefined,
      directReportsCount: r.directReportsCount ? Number(r.directReportsCount) : 0,
      performanceRating: r.performanceRating,
      potentialRating: r.potentialRating,
      nineBoxGrid: Number(r.nineBoxGrid),
      trainings: JSON.parse(r.trainings_json || '{}'),
      radar: JSON.parse(r.radar_json || '{}'),
      careerPaths: JSON.parse(r.careerPaths_json || '[]'),
      isKeyTalent: Boolean(r.isKeyTalent),
      isSuccessorReady: Boolean(r.isSuccessorReady),
      notes: r.notes || undefined
    }));
  }

  // LocalStorage Fallback
  const saved = localStorage.getItem('workforce_os_v2_employees');
  return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
}

export async function saveEmployeeToDb(emp: Employee): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO employees 
       (id, nip, name, email, avatarUrl, department, jobTitle, level, grade, education, tenureYears, joinDate, birthYear, employmentType, contractEndDate, managerName, managerId, directReportsCount, performanceRating, potentialRating, nineBoxGrid, trainings_json, radar_json, careerPaths_json, isKeyTalent, isSuccessorReady, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, CURRENT_TIMESTAMP)`,
      [
        emp.id,
        emp.nip,
        emp.name,
        emp.email,
        emp.avatarUrl || '',
        emp.department,
        emp.jobTitle,
        emp.level,
        emp.grade,
        emp.education,
        emp.tenureYears,
        emp.joinDate,
        emp.birthYear,
        emp.employmentType,
        emp.contractEndDate || null,
        emp.managerName || null,
        emp.managerId || null,
        emp.directReportsCount || 0,
        emp.performanceRating,
        emp.potentialRating,
        emp.nineBoxGrid,
        JSON.stringify(emp.trainings || {}),
        JSON.stringify(emp.radar || {}),
        JSON.stringify(emp.careerPaths || []),
        emp.isKeyTalent ? 1 : 0,
        emp.isSuccessorReady ? 1 : 0,
        emp.notes || null
      ]
    );
  }
}

export async function deleteEmployeeFromDb(empId: string): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute('DELETE FROM employees WHERE id = $1', [empId]);
  }
}

// -------------------------------------------------------------
// 2. TRAINING MODULE OPERATIONS
// -------------------------------------------------------------

export async function fetchTrainingModules(): Promise<TrainingModule[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM training_modules ORDER BY code ASC');
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      category: r.category,
      durationHours: Number(r.durationHours),
      provider: r.provider,
      description: r.description,
      mandatoryForRoles: JSON.parse(r.mandatoryForRoles_json || '[]')
    }));
  }

  const saved = localStorage.getItem('workforce_os_v2_modules');
  return saved ? JSON.parse(saved) : INITIAL_TRAINING_MODULES;
}

export async function saveTrainingModuleToDb(mod: TrainingModule): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO training_modules 
       (id, code, name, category, durationHours, provider, description, mandatoryForRoles_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        mod.id,
        mod.code,
        mod.name,
        mod.category,
        mod.durationHours,
        mod.provider,
        mod.description,
        JSON.stringify(mod.mandatoryForRoles || [])
      ]
    );
  }
}

export async function deleteTrainingModuleFromDb(id: string): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute('DELETE FROM training_modules WHERE id = $1', [id]);
  }
}

// -------------------------------------------------------------
// 3. TNA RULES OPERATIONS
// -------------------------------------------------------------

export async function fetchTnaRules(): Promise<Record<string, TNARule>> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM tna_rules');
    const result: Record<string, TNARule> = {};
    for (const r of rows) {
      result[r.rule_key] = {
        id: r.id,
        department: r.department,
        level: r.level,
        minEdu: r.minEdu,
        minTenureYears: Number(r.minTenureYears),
        requiredTrainingIds: JSON.parse(r.requiredTrainingIds_json || '[]')
      };
    }
    return result;
  }

  const saved = localStorage.getItem('workforce_os_v2_rules');
  return saved ? JSON.parse(saved) : INITIAL_TNA_RULES;
}

export async function saveTnaRuleToDb(key: string, rule: TNARule): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO tna_rules 
       (id, rule_key, department, level, minEdu, minTenureYears, requiredTrainingIds_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [
        rule.id,
        key,
        rule.department,
        rule.level,
        rule.minEdu,
        rule.minTenureYears,
        JSON.stringify(rule.requiredTrainingIds || [])
      ]
    );
  }
}

// -------------------------------------------------------------
// 4. CRITICAL POSITIONS OPERATIONS
// -------------------------------------------------------------

export async function fetchCriticalPositions(): Promise<CriticalPosition[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM critical_positions');
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      department: r.department,
      currentHolder: r.currentHolder,
      currentHolderId: r.currentHolderId,
      riskLevel: r.riskLevel,
      businessImpact: r.businessImpact,
      retirementYearsRemaining: Number(r.retirementYearsRemaining),
      successors: JSON.parse(r.successors_json || '[]')
    }));
  }

  const saved = localStorage.getItem('workforce_os_v2_critical_pos');
  return saved ? JSON.parse(saved) : CRITICAL_POSITIONS;
}

export async function saveCriticalPositionToDb(pos: CriticalPosition): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO critical_positions 
       (id, title, department, currentHolder, currentHolderId, riskLevel, businessImpact, retirementYearsRemaining, successors_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
      [
        pos.id,
        pos.title,
        pos.department,
        pos.currentHolder,
        pos.currentHolderId,
        pos.riskLevel,
        pos.businessImpact,
        pos.retirementYearsRemaining,
        JSON.stringify(pos.successors || [])
      ]
    );
  }
}

export async function deleteCriticalPositionFromDb(id: string): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute('DELETE FROM critical_positions WHERE id = $1', [id]);
  }
}

// -------------------------------------------------------------
// 5. MPP PLANS OPERATIONS
// -------------------------------------------------------------

export async function fetchMppPlans(): Promise<ManpowerDeptPlan[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM mpp_plans');
    return rows.map((r) => ({
      department: r.department,
      currentHeadcount: Number(r.currentHeadcount),
      projectedTurnover: Number(r.projectedTurnover),
      projectedRetirements: Number(r.projectedRetirements),
      projectedSupply: Number(r.projectedSupply),
      requiredDemand: Number(r.requiredDemand),
      gap: Number(r.gap),
      interventions: JSON.parse(r.interventions_json || '{}'),
      estimatedBudgetMillionIDR: Number(r.estimatedBudgetMillionIDR)
    }));
  }

  const saved = localStorage.getItem('workforce_os_v2_mpp');
  return saved ? JSON.parse(saved) : INITIAL_MPP_DATA;
}

export async function saveMppPlanToDb(plan: ManpowerDeptPlan): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO mpp_plans 
       (department, currentHeadcount, projectedTurnover, projectedRetirements, projectedSupply, requiredDemand, gap, interventions_json, estimatedBudgetMillionIDR, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
      [
        plan.department,
        plan.currentHeadcount,
        plan.projectedTurnover,
        plan.projectedRetirements,
        plan.projectedSupply,
        plan.requiredDemand,
        plan.gap,
        JSON.stringify(plan.interventions || {}),
        plan.estimatedBudgetMillionIDR
      ]
    );
  }
}

// -------------------------------------------------------------
// 6. JOB POSITIONS OPERATIONS
// -------------------------------------------------------------

export async function fetchJobPositions(): Promise<JobPosition[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM job_positions ORDER BY department ASC, code ASC');
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      department: r.department,
      level: r.level,
      grade: r.grade,
      reportsToPositionId: r.reportsToPositionId || undefined,
      reportsToTitle: r.reportsToTitle || undefined,
      reportsToLevel: r.reportsToLevel || undefined,
      targetHeadcount: Number(r.targetHeadcount) || 1,
      minEdu: r.minEdu || undefined,
      minTenureYears: Number(r.minTenureYears) || 0,
      isCritical: Boolean(r.isCritical),
      description: r.description || undefined
    }));
  }

  const saved = localStorage.getItem('workforce_os_v2_job_positions');
  return saved ? JSON.parse(saved) : INITIAL_JOB_POSITIONS;
}

export async function saveJobPositionToDb(pos: JobPosition): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO job_positions 
       (id, code, title, department, level, grade, reportsToPositionId, reportsToTitle, reportsToLevel, targetHeadcount, minEdu, minTenureYears, isCritical, description, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)`,
      [
        pos.id,
        pos.code,
        pos.title,
        pos.department,
        pos.level,
        pos.grade,
        pos.reportsToPositionId || null,
        pos.reportsToTitle || null,
        pos.reportsToLevel || null,
        pos.targetHeadcount,
        pos.minEdu || null,
        pos.minTenureYears || 0,
        pos.isCritical ? 1 : 0,
        pos.description || null
      ]
    );
  }
}

export async function deleteJobPositionFromDb(id: string): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute('DELETE FROM job_positions WHERE id = $1', [id]);
  }
}

// -------------------------------------------------------------
// 7. COMPETENCIES OPERATIONS
// -------------------------------------------------------------

export async function fetchCompetencies(): Promise<CompetencyItem[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM competencies ORDER BY code ASC');
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      category: r.category,
      description: r.description || '',
      levels: JSON.parse(r.levels_json || '{}')
    }));
  }
  const saved = localStorage.getItem('workforce_os_v2_competencies');
  return saved ? JSON.parse(saved) : INITIAL_COMPETENCIES;
}

export async function saveCompetencyToDb(comp: CompetencyItem): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO competencies (id, code, name, category, description, levels_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [comp.id, comp.code, comp.name, comp.category, comp.description || '', JSON.stringify(comp.levels || {})]
    );
  }
}

export async function deleteCompetencyFromDb(id: string): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute('DELETE FROM competencies WHERE id = $1', [id]);
  }
}

// -------------------------------------------------------------
// 8. WORKFORCE MOVEMENTS OPERATIONS
// -------------------------------------------------------------

export async function fetchWorkforceMovements(): Promise<WorkforceMovement[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM workforce_movements ORDER BY effectiveDate DESC');
    return rows.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      type: r.type,
      fromPosition: r.fromPosition,
      toPosition: r.toPosition,
      fromDepartment: r.fromDepartment,
      toDepartment: r.toDepartment,
      fromGrade: r.fromGrade || undefined,
      toGrade: r.toGrade || undefined,
      effectiveDate: r.effectiveDate,
      skNumber: r.skNumber || undefined,
      reason: r.reason || undefined,
      approvedBy: r.approvedBy || undefined,
      status: r.status
    }));
  }
  const saved = localStorage.getItem('workforce_os_v2_movements');
  return saved ? JSON.parse(saved) : INITIAL_WORKFORCE_MOVEMENTS;
}

export async function saveWorkforceMovementToDb(mov: WorkforceMovement): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO workforce_movements
       (id, employeeId, employeeName, type, fromPosition, toPosition, fromDepartment, toDepartment, fromGrade, toGrade, effectiveDate, skNumber, reason, approvedBy, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)`,
      [mov.id, mov.employeeId, mov.employeeName, mov.type, mov.fromPosition, mov.toPosition, mov.fromDepartment, mov.toDepartment, mov.fromGrade || null, mov.toGrade || null, mov.effectiveDate, mov.skNumber || null, mov.reason || null, mov.approvedBy || null, mov.status]
    );
  }
}

// -------------------------------------------------------------
// 9. TRAINING EVENTS OPERATIONS
// -------------------------------------------------------------

export async function fetchTrainingEvents(): Promise<TrainingEvent[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM training_events ORDER BY startDate DESC');
    return rows.map((r) => ({
      id: r.id,
      moduleId: r.moduleId,
      moduleCode: r.moduleCode,
      moduleName: r.moduleName,
      batchNumber: Number(r.batchNumber),
      trainerId: r.trainerId,
      trainerName: r.trainerName,
      startDate: r.startDate,
      endDate: r.endDate,
      location: r.location,
      maxParticipants: Number(r.maxParticipants),
      attendees: JSON.parse(r.attendees_json || '[]'),
      status: r.status
    }));
  }
  const saved = localStorage.getItem('workforce_os_v2_events');
  return saved ? JSON.parse(saved) : INITIAL_TRAINING_EVENTS;
}

export async function saveTrainingEventToDb(evt: TrainingEvent): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO training_events
       (id, moduleId, moduleCode, moduleName, batchNumber, trainerId, trainerName, startDate, endDate, location, maxParticipants, attendees_json, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)`,
      [evt.id, evt.moduleId, evt.moduleCode, evt.moduleName, evt.batchNumber, evt.trainerId, evt.trainerName, evt.startDate, evt.endDate, evt.location, evt.maxParticipants, JSON.stringify(evt.attendees || []), evt.status]
    );
  }
}

// -------------------------------------------------------------
// 10. DETAILED IDP OPERATIONS
// -------------------------------------------------------------

export async function fetchDetailedIdps(): Promise<DetailedIDP[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM detailed_idps');
    return rows.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      targetPosition: r.targetPosition,
      periodYear: Number(r.periodYear),
      strategicFocus: r.strategicFocus || undefined,
      experience70: JSON.parse(r.experience70_json || '[]'),
      exposure20: JSON.parse(r.exposure20_json || '[]'),
      education10: JSON.parse(r.education10_json || '[]')
    }));
  }
  const saved = localStorage.getItem('workforce_os_v2_detailed_idps');
  return saved ? JSON.parse(saved) : INITIAL_DETAILED_IDPS;
}

export async function saveDetailedIdpToDb(idp: DetailedIDP): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO detailed_idps
       (id, employeeId, employeeName, targetPosition, periodYear, strategicFocus, experience70_json, exposure20_json, education10_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
      [idp.id, idp.employeeId, idp.employeeName, idp.targetPosition, idp.periodYear, idp.strategicFocus || null, JSON.stringify(idp.experience70 || []), JSON.stringify(idp.exposure20 || []), JSON.stringify(idp.education10 || [])]
    );
  }
}

// -------------------------------------------------------------
// 11. CAREER NODES OPERATIONS
// -------------------------------------------------------------

export async function fetchCareerNodes(): Promise<CareerNode[]> {
  if (isUsingSQLite() && dbInstance) {
    const rows = await dbInstance.select<any[]>('SELECT * FROM career_nodes ORDER BY node_order ASC');
    return rows.map((r) => ({
      id: r.id,
      trackId: r.trackId,
      trackName: r.trackName,
      department: r.department,
      title: r.title,
      level: r.level,
      grade: r.grade,
      order: Number(r.node_order),
      educationReq: r.educationReq,
      minTenureYears: Number(r.minTenureYears),
      requiredCompetencies: JSON.parse(r.requiredCompetencies_json || '[]'),
      requiredTrainings: JSON.parse(r.requiredTrainings_json || '[]'),
      leadershipMinScore: Number(r.leadershipMinScore) || 70,
      performanceMinRating: r.performanceMinRating || 'High',
      salaryRangeMillionIDR: JSON.parse(r.salaryRange_json || '{}')
    }));
  }
  const saved = localStorage.getItem('workforce_os_v2_career_nodes');
  return saved ? JSON.parse(saved) : INITIAL_CAREER_NODES;
}

export async function saveCareerNodeToDb(cn: CareerNode): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute(
      `INSERT OR REPLACE INTO career_nodes
       (id, trackId, trackName, department, title, level, grade, node_order, educationReq, minTenureYears, requiredCompetencies_json, requiredTrainings_json, leadershipMinScore, performanceMinRating, salaryRange_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)`,
      [cn.id, cn.trackId, cn.trackName, cn.department, cn.title, cn.level, cn.grade, cn.order, cn.educationReq, cn.minTenureYears, JSON.stringify(cn.requiredCompetencies || []), JSON.stringify(cn.requiredTrainings || []), cn.leadershipMinScore || 70, cn.performanceMinRating || 'High', JSON.stringify(cn.salaryRangeMillionIDR || {})]
    );
  }
}

// -------------------------------------------------------------
// 12. AUDIT TRAIL / ACTIVITY LOGS
// -------------------------------------------------------------

export async function logActivityToDb(moduleName: string, action: string, description: string, actorName: string = 'Sistem / User'): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    const id = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    await dbInstance.execute(
      `INSERT INTO activity_logs (id, module, action, description, actorName) VALUES ($1, $2, $3, $4, $5)`,
      [id, moduleName, action, description, actorName]
    );
  }
}

// -------------------------------------------------------------
// BULK OPERATIONS FOR IMPORT & RESTORE
// -------------------------------------------------------------

export async function bulkSaveEmployeesToDb(employees: Employee[], mode: 'merge' | 'replace' = 'merge'): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    if (mode === 'replace') {
      await dbInstance.execute('DELETE FROM employees');
    }
    for (const emp of employees) {
      await saveEmployeeToDb(emp);
    }
  } else {
    if (mode === 'replace') {
      localStorage.setItem('workforce_os_v2_employees', JSON.stringify(employees));
    } else {
      const existing = await fetchEmployees();
      const existingMap = new Map(existing.map((e) => [e.nip, e]));
      for (const emp of employees) {
        existingMap.set(emp.nip, emp);
      }
      localStorage.setItem('workforce_os_v2_employees', JSON.stringify(Array.from(existingMap.values())));
    }
  }
}

export async function bulkSaveTrainingModulesToDb(modules: TrainingModule[], mode: 'merge' | 'replace' = 'merge'): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    if (mode === 'replace') {
      await dbInstance.execute('DELETE FROM training_modules');
    }
    for (const mod of modules) {
      await saveTrainingModuleToDb(mod);
    }
  } else {
    if (mode === 'replace') {
      localStorage.setItem('workforce_os_v2_modules', JSON.stringify(modules));
    } else {
      const existing = await fetchTrainingModules();
      const existingMap = new Map(existing.map((m) => [m.code, m]));
      for (const mod of modules) {
        existingMap.set(mod.code, mod);
      }
      localStorage.setItem('workforce_os_v2_modules', JSON.stringify(Array.from(existingMap.values())));
    }
  }
}

export async function bulkSaveTnaRulesToDb(rules: Record<string, TNARule>, mode: 'merge' | 'replace' = 'merge'): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    if (mode === 'replace') {
      await dbInstance.execute('DELETE FROM tna_rules');
    }
    for (const [key, rule] of Object.entries(rules)) {
      await saveTnaRuleToDb(key, rule);
    }
  } else {
    if (mode === 'replace') {
      localStorage.setItem('workforce_os_v2_rules', JSON.stringify(rules));
    } else {
      const existing = await fetchTnaRules();
      const merged = { ...existing, ...rules };
      localStorage.setItem('workforce_os_v2_rules', JSON.stringify(merged));
    }
  }
}

export async function bulkSaveCriticalPositionsToDb(positions: CriticalPosition[], mode: 'merge' | 'replace' = 'merge'): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    if (mode === 'replace') {
      await dbInstance.execute('DELETE FROM critical_positions');
    }
    for (const pos of positions) {
      await saveCriticalPositionToDb(pos);
    }
  } else {
    if (mode === 'replace') {
      localStorage.setItem('workforce_os_v2_critical_pos', JSON.stringify(positions));
    } else {
      const existing = await fetchCriticalPositions();
      const existingMap = new Map(existing.map((p) => [p.id, p]));
      for (const pos of positions) {
        existingMap.set(pos.id, pos);
      }
      localStorage.setItem('workforce_os_v2_critical_pos', JSON.stringify(Array.from(existingMap.values())));
    }
  }
}

export async function bulkSaveMppPlansToDb(plans: ManpowerDeptPlan[], mode: 'merge' | 'replace' = 'merge'): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    if (mode === 'replace') {
      await dbInstance.execute('DELETE FROM mpp_plans');
    }
    for (const plan of plans) {
      await saveMppPlanToDb(plan);
    }
  } else {
    if (mode === 'replace') {
      localStorage.setItem('workforce_os_v2_mpp', JSON.stringify(plans));
    } else {
      const existing = await fetchMppPlans();
      const existingMap = new Map(existing.map((p) => [p.department, p]));
      for (const plan of plans) {
        existingMap.set(plan.department, plan);
      }
      localStorage.setItem('workforce_os_v2_mpp', JSON.stringify(Array.from(existingMap.values())));
    }
  }
}

export async function bulkSaveJobPositionsToDb(positions: JobPosition[], mode: 'merge' | 'replace' = 'merge'): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    if (mode === 'replace') {
      await dbInstance.execute('DELETE FROM job_positions');
    }
    for (const pos of positions) {
      await saveJobPositionToDb(pos);
    }
  } else {
    if (mode === 'replace') {
      localStorage.setItem('workforce_os_v2_job_positions', JSON.stringify(positions));
    } else {
      const existing = await fetchJobPositions();
      const existingMap = new Map(existing.map((p) => [p.id, p]));
      for (const pos of positions) {
        existingMap.set(pos.id, pos);
      }
      localStorage.setItem('workforce_os_v2_job_positions', JSON.stringify(Array.from(existingMap.values())));
    }
  }
}

// -------------------------------------------------------------
// RESET / RE-SEED DATABASE
// -------------------------------------------------------------

export async function resetAndReseedDatabase(): Promise<void> {
  if (isUsingSQLite() && dbInstance) {
    await dbInstance.execute('DELETE FROM system_meta WHERE key = $1', ['seed_version']);
    await dbInstance.execute('DELETE FROM employees');
    await dbInstance.execute('DELETE FROM training_modules');
    await dbInstance.execute('DELETE FROM tna_rules');
    await dbInstance.execute('DELETE FROM critical_positions');
    await dbInstance.execute('DELETE FROM mpp_plans');
    await dbInstance.execute('DELETE FROM job_positions');
    await dbInstance.execute('DELETE FROM competencies');
    await dbInstance.execute('DELETE FROM position_competencies');
    await dbInstance.execute('DELETE FROM workforce_movements');
    await dbInstance.execute('DELETE FROM annual_training_plans');
    await dbInstance.execute('DELETE FROM trainers');
    await dbInstance.execute('DELETE FROM training_events');
    await dbInstance.execute('DELETE FROM detailed_idps');
    await dbInstance.execute('DELETE FROM career_nodes');
    await runDatabaseSeeder(dbInstance);
  } else {
    localStorage.removeItem('workforce_os_v2_employees');
    localStorage.removeItem('workforce_os_v2_modules');
    localStorage.removeItem('workforce_os_v2_rules');
    localStorage.removeItem('workforce_os_v2_critical_pos');
    localStorage.removeItem('workforce_os_v2_mpp');
    localStorage.removeItem('workforce_os_v2_job_positions');
    localStorage.removeItem('workforce_os_v2_competencies');
    localStorage.removeItem('workforce_os_v2_pos_competencies');
    localStorage.removeItem('workforce_os_v2_movements');
    localStorage.removeItem('workforce_os_v2_atp');
    localStorage.removeItem('workforce_os_v2_trainers');
    localStorage.removeItem('workforce_os_v2_events');
    localStorage.removeItem('workforce_os_v2_reminders');
    localStorage.removeItem('workforce_os_v2_detailed_idps');
    localStorage.removeItem('workforce_os_v2_career_nodes');
    localStorage.removeItem('workforce_os_v2_mpp_scenarios');
    localStorage.removeItem('workforce_os_v2_agentic_actions');
    localStorage.removeItem('workforce_os_v2_notifications');
  }
}
