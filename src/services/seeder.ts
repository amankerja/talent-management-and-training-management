import Database from '@tauri-apps/plugin-sql';
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

export const SEED_VERSION = '2.1.0';

/**
 * Checks if the database is already seeded. If not, seeds all initial master data.
 */
export async function runDatabaseSeeder(db: Database): Promise<{ seeded: boolean; employeeCount: number }> {
  try {
    // 1. Check if system_meta already has seed version
    const metaRows = await db.select<{ value: string }[]>(
      "SELECT value FROM system_meta WHERE key = 'seed_version' LIMIT 1"
    );

    if (metaRows.length > 0 && metaRows[0].value === SEED_VERSION) {
      const empCountResult = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM employees");
      return { seeded: false, employeeCount: empCountResult[0]?.count || 0 };
    }

    console.log(`[DatabaseSeeder] Seeding database version ${SEED_VERSION}...`);

    // Clean previous records for a fresh, clean relational state
    await db.execute("DELETE FROM employees");
    await db.execute("DELETE FROM job_positions");
    await db.execute("DELETE FROM critical_positions");
    await db.execute("DELETE FROM mpp_plans");
    await db.execute("DELETE FROM tna_rules");
    await db.execute("DELETE FROM training_modules");
    await db.execute("DELETE FROM competencies");
    await db.execute("DELETE FROM position_competencies");
    await db.execute("DELETE FROM workforce_movements");
    await db.execute("DELETE FROM annual_training_plans");
    await db.execute("DELETE FROM trainers");
    await db.execute("DELETE FROM training_events");
    await db.execute("DELETE FROM detailed_idps");
    await db.execute("DELETE FROM career_nodes");

    // 2. Seed Training Modules
    for (const mod of INITIAL_TRAINING_MODULES) {
      await db.execute(
        `INSERT OR REPLACE INTO training_modules 
         (id, code, name, category, durationHours, provider, description, mandatoryForRoles_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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

    // 3. Seed TNA Rules
    for (const [key, rule] of Object.entries(INITIAL_TNA_RULES)) {
      await db.execute(
        `INSERT OR REPLACE INTO tna_rules 
         (id, rule_key, department, level, minEdu, minTenureYears, requiredTrainingIds_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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

    // 4. Seed Critical Positions
    for (const pos of CRITICAL_POSITIONS) {
      await db.execute(
        `INSERT OR REPLACE INTO critical_positions 
         (id, title, department, currentHolder, currentHolderId, riskLevel, businessImpact, retirementYearsRemaining, successors_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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

    // 5. Seed MPP Plans
    for (const mpp of INITIAL_MPP_DATA) {
      await db.execute(
        `INSERT OR REPLACE INTO mpp_plans 
         (department, currentHeadcount, projectedTurnover, projectedRetirements, projectedSupply, requiredDemand, gap, interventions_json, estimatedBudgetMillionIDR)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          mpp.department,
          mpp.currentHeadcount,
          mpp.projectedTurnover,
          mpp.projectedRetirements,
          mpp.projectedSupply,
          mpp.requiredDemand,
          mpp.gap,
          JSON.stringify(mpp.interventions || {}),
          mpp.estimatedBudgetMillionIDR
        ]
      );
    }

    // 6. Seed Job Positions (Master Level Management)
    for (const jpos of INITIAL_JOB_POSITIONS) {
      await db.execute(
        `INSERT OR REPLACE INTO job_positions
         (id, code, title, department, level, grade, reportsToPositionId, reportsToTitle, reportsToLevel, targetHeadcount, minEdu, minTenureYears, isCritical, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          jpos.id,
          jpos.code,
          jpos.title,
          jpos.department,
          jpos.level,
          jpos.grade,
          jpos.reportsToPositionId || null,
          jpos.reportsToTitle || null,
          jpos.reportsToLevel || null,
          jpos.targetHeadcount,
          jpos.minEdu || null,
          jpos.minTenureYears || 0,
          jpos.isCritical ? 1 : 0,
          jpos.description || null
        ]
      );
    }

    // 7. Seed Employees
    for (const emp of INITIAL_EMPLOYEES) {
      await db.execute(
        `INSERT OR REPLACE INTO employees 
         (id, nip, name, email, avatarUrl, department, jobTitle, level, grade, education, tenureYears, joinDate, birthYear, employmentType, contractEndDate, managerName, managerId, directReportsCount, performanceRating, potentialRating, nineBoxGrid, trainings_json, radar_json, careerPaths_json, isKeyTalent, isSuccessorReady, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)`,
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

    // 8. Seed Competencies
    for (const comp of INITIAL_COMPETENCIES) {
      await db.execute(
        `INSERT OR REPLACE INTO competencies (id, code, name, category, description, levels_json)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [comp.id, comp.code, comp.name, comp.category, comp.description, JSON.stringify(comp.levels || {})]
      );
    }

    // 9. Seed Position Competencies
    for (const pcomp of INITIAL_POSITION_COMPETENCIES) {
      await db.execute(
        `INSERT OR REPLACE INTO position_competencies (id, positionId, positionTitle, department, jobLevel, requirements_json)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pcomp.id, pcomp.positionId, pcomp.positionTitle, pcomp.department, pcomp.jobLevel, JSON.stringify(pcomp.requirements || [])]
      );
    }

    // 10. Seed Workforce Movements
    for (const mov of INITIAL_WORKFORCE_MOVEMENTS) {
      await db.execute(
        `INSERT OR REPLACE INTO workforce_movements 
         (id, employeeId, employeeName, type, fromPosition, toPosition, fromDepartment, toDepartment, fromGrade, toGrade, effectiveDate, skNumber, reason, approvedBy, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [mov.id, mov.employeeId, mov.employeeName, mov.type, mov.fromPosition, mov.toPosition, mov.fromDepartment, mov.toDepartment, mov.fromGrade || null, mov.toGrade || null, mov.effectiveDate, mov.skNumber || null, mov.reason || null, mov.approvedBy || null, mov.status]
      );
    }

    // 11. Seed Annual Training Plans (ATP)
    for (const atp of INITIAL_ANNUAL_TRAINING_PLANS) {
      await db.execute(
        `INSERT OR REPLACE INTO annual_training_plans
         (id, moduleCode, moduleName, category, department, plannedMonth, targetParticipants, actualParticipants, estimatedBudgetMillionIDR, actualCostMillionIDR, status, trainerId, trainerName)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [atp.id, atp.moduleCode, atp.moduleName, atp.category, atp.department, atp.plannedMonth, atp.targetParticipants, atp.actualParticipants || 0, atp.estimatedBudgetMillionIDR, atp.actualCostMillionIDR || null, atp.status, atp.trainerId || null, atp.trainerName || null]
      );
    }

    // 12. Seed Trainers
    for (const tr of INITIAL_TRAINERS) {
      await db.execute(
        `INSERT OR REPLACE INTO trainers (id, name, organization, type, email, phone, specializations_json, rating, ratePerDayMillionIDR)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [tr.id, tr.name, tr.organization, tr.type, tr.email || null, tr.phone || null, JSON.stringify(tr.specializations || []), tr.rating || 5.0, tr.ratePerDayMillionIDR || 0]
      );
    }

    // 13. Seed Training Events
    for (const evt of INITIAL_TRAINING_EVENTS) {
      await db.execute(
        `INSERT OR REPLACE INTO training_events (id, moduleId, moduleCode, moduleName, batchNumber, trainerId, trainerName, startDate, endDate, location, maxParticipants, attendees_json, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [evt.id, evt.moduleId, evt.moduleCode, evt.moduleName, evt.batchNumber, evt.trainerId, evt.trainerName, evt.startDate, evt.endDate, evt.location, evt.maxParticipants, JSON.stringify(evt.attendees || []), evt.status]
      );
    }

    // 14. Seed Detailed IDPs
    for (const idp of INITIAL_DETAILED_IDPS) {
      await db.execute(
        `INSERT OR REPLACE INTO detailed_idps (id, employeeId, employeeName, targetPosition, periodYear, strategicFocus, experience70_json, exposure20_json, education10_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [idp.id, idp.employeeId, idp.employeeName, idp.targetPosition, idp.periodYear, idp.strategicFocus || null, JSON.stringify(idp.experience70 || []), JSON.stringify(idp.exposure20 || []), JSON.stringify(idp.education10 || [])]
      );
    }

    // 15. Seed Career Nodes
    for (const cn of INITIAL_CAREER_NODES) {
      await db.execute(
        `INSERT OR REPLACE INTO career_nodes (id, trackId, trackName, department, title, level, grade, node_order, educationReq, minTenureYears, requiredCompetencies_json, requiredTrainings_json, leadershipMinScore, performanceMinRating, salaryRange_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [cn.id, cn.trackId, cn.trackName, cn.department, cn.title, cn.level, cn.grade, cn.order, cn.educationReq, cn.minTenureYears, JSON.stringify(cn.requiredCompetencies || []), JSON.stringify(cn.requiredTrainings || []), cn.leadershipMinScore || 70, cn.performanceMinRating || 'High', JSON.stringify(cn.salaryRangeMillionIDR || {})]
      );
    }

    // 16. Mark seed version in system_meta
    await db.execute(
      `INSERT OR REPLACE INTO system_meta (key, value, updated_at) VALUES ('seed_version', $1, CURRENT_TIMESTAMP)`,
      [SEED_VERSION]
    );

    console.log(`[DatabaseSeeder] Successfully seeded enterprise database version ${SEED_VERSION} with full relational integrity.`);

    return { seeded: true, employeeCount: INITIAL_EMPLOYEES.length };
  } catch (error) {
    console.error('[DatabaseSeeder] Seeding error:', error);
    throw error;
  }
}
