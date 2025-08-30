import { adminDb, FieldValue as AdminFieldValue } from '@/lib/firebase/admin';
import { z } from 'zod';
import type { FieldValue } from 'firebase-admin/firestore';

// Benefit Plan schema
export const benefitPlanSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['health', 'dental', 'vision', 'life', 'disability', 'retirement']),
  category: z.string().optional(),
  provider: z.string().optional(),
  deductibleIndividual: z.number().optional(),
  deductibleFamily: z.number().optional(),
  outOfPocketMaxIndividual: z.number().optional(),
  outOfPocketMaxFamily: z.number().optional(),
  monthlyPremium: z.number().optional(),
  coverageDetails: z.record(z.any()).optional(),
});

export type BenefitPlan = z.infer<typeof benefitPlanSchema> & {
  id: string;
  companyId: string;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
};

// Benefit Enrollment schema
export const benefitEnrollmentSchema = z.object({
  benefitPlanId: z.string(),
  status: z.enum(['active', 'waived', 'pending']),
  coverageType: z.enum(['individual', 'family']),
  monthlyCost: z.number(),
  electedOn: z.string().datetime(),
});

export type BenefitEnrollment = z.infer<typeof benefitEnrollmentSchema> & {
  id: string;
  userId: string;
  companyId: string;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
};

/**
 * Service for managing benefit data in Firebase
 */
export class BenefitService {
  /**
   * Create a new benefit plan
   */
  async createBenefitPlan(
    companyId: string,
    planData: z.infer<typeof benefitPlanSchema>
  ): Promise<string> {
    try {
      const validated = benefitPlanSchema.parse(planData);
      
      const planRef = adminDb.collection('companies').doc(companyId).collection('benefitPlans').doc();
      const planId = planRef.id;

      await planRef.set({
        id: planId,
        companyId,
        ...validated,
        createdAt: AdminFieldValue.serverTimestamp(),
        updatedAt: AdminFieldValue.serverTimestamp()
      });

      return planId;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Invalid benefit plan data:', error.errors);
        throw new Error('Invalid benefit plan data format');
      }
      console.error('Failed to create benefit plan:', error);
      throw error;
    }
  }

  /**
   * Get all benefit plans for a company
   */
  async getBenefitPlans(companyId: string): Promise<BenefitPlan[]> {
    try {
      const snapshot = await adminDb.collection('companies').doc(companyId).collection('benefitPlans').get();
      return snapshot.docs.map(doc => doc.data() as BenefitPlan);
    } catch (error) {
      console.error(`Failed to get benefit plans for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Enroll a user in a benefit plan
   */
  async enrollInBenefitPlan(
    userId: string,
    companyId: string,
    enrollmentData: z.infer<typeof benefitEnrollmentSchema>
  ): Promise<string> {
    try {
      const validated = benefitEnrollmentSchema.parse(enrollmentData);
      
      const enrollmentRef = adminDb.collection('users').doc(userId).collection('benefitEnrollments').doc();
      const enrollmentId = enrollmentRef.id;

      await enrollmentRef.set({
        id: enrollmentId,
        userId,
        companyId,
        ...validated,
        createdAt: AdminFieldValue.serverTimestamp(),
        updatedAt: AdminFieldValue.serverTimestamp()
      });

      return enrollmentId;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Invalid enrollment data:', error.errors);
        throw new Error('Invalid enrollment data format');
      }
      console.error('Failed to enroll in benefit plan:', error);
      throw error;
    }
  }

  /**
   * Get a user's benefit enrollments
   */
  async getBenefitEnrollments(userId: string): Promise<BenefitEnrollment[]> {
    try {
      const snapshot = await adminDb.collection('users').doc(userId).collection('benefitEnrollments').get();
      return snapshot.docs.map(doc => doc.data() as BenefitEnrollment);
    } catch (error) {
      console.error(`Failed to get benefit enrollments for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a benefit enrollment
   */
  async cancelBenefitEnrollment(userId: string, enrollmentId: string): Promise<void> {
    try {
      await adminDb.collection('users').doc(userId).collection('benefitEnrollments').doc(enrollmentId).update({
        status: 'cancelled',
        updatedAt: AdminFieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error(`Failed to cancel benefit enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const benefitService = new BenefitService();