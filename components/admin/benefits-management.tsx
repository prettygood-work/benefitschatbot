'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Heart,
  Shield,
  Eye,
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Building2,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BenefitPlan {
  id: string;
  name: string;
  planType: 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'other';
  provider: string;
  coverage: string;
  monthlyCost: number;
  employerContribution: number;
  deductible?: number;
  outOfPocketMax?: number;
  coverageDetails: any;
  eligibilityRules: any;
  isActive: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BenefitsManagementProps {
  companyId: string;
  companyName?: string;
}

export function BenefitsManagement({ companyId, companyName = 'Your Company' }: BenefitsManagementProps) {
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog peaceful/test setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BenefitPlan | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    planType: 'health',
    provider: '',
    coverage: '',
    monthlyCost: '',
    employerContribution: '',
    deductible: '',
    outOfPocketMax: '',
    description: '',
  });

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    const mockPlans: BenefitPlan[] = [
      {
        id: '1',
        name: 'Premium Health Insurance',
        planType: 'health',
        provider: 'Blue Cross Blue Shield',
        coverage: 'Comprehensive medical coverage',
        monthlyCost: 450,
        employerContribution: 350,
        deductible: 1500,
        outOfPocketMax: 5000,
        coverageDetails: { network: 'PPO', copay: 30 },
        eligibilityRules: { waitingPeriod: 30 },
        isActive: true,
        enrollmentCount: 45,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        name: 'Basic Dental Coverage',
        planType: 'dental',
        provider: 'Delta Dental',
        coverage: 'Preventive and basic dental care',
        monthlyCost: 50,
        employerContribution: 30,
        coverageDetails: { preventive: '100%', basic: '80%', major: '50%' },
        eligibilityRules: { waitingPeriod: 0 },
        isActive: true,
        enrollmentCount: 38,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        name: 'Vision Care',
        planType: 'vision',
        provider: 'VSP',
        coverage: 'Annual eye exams and corrective lenses',
        monthlyCost: 15,
        employerContribution: 10,
        coverageDetails: { examCoverage: '$10 copay', frameAllowance: '$150' },
        eligibilityRules: { waitingPeriod: 0 },
        isActive: true,
        enrollmentCount: 25,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    ];

    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 500);
  }, [companyId]);

  const handleCreatePlan = async () => {
    try {
      // TODO: API call to create plan
      toast({
        title: "Plan Created",
        description: `${formData.name} has been created successfully`,
      });
      setShowCreateDialog(false);
      resetForm();
      // Refresh plans
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create benefit plan",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlan = async (planId: string) => {
    try {
      // TODO: API call to update plan
      toast({
        title: "Plan Updated",
        description: "The benefit plan has been updated successfully",
      });
      setEditingPlan(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update benefit plan",
        variant: "destructive",
      });
    }
  };

  const handleTogglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      // TODO: API call to toggle status
      toast({
        title: currentStatus ? "Plan Deactivated" : "Plan Activated",
        description: `The plan has been ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
      // Update local state
      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, isActive: !currentStatus } : plan
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      planType: 'health',
      provider: '',
      coverage: '',
      monthlyCost: '',
      employerContribution: '',
      deductible: '',
      outOfPocketMax: '',
      description: '',
    });
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'health': return <Heart className="h-5 w-5" />;
      case 'dental': return <Shield className="h-5 w-5" />;
      case 'vision': return <Eye className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  const activePlans = plans.filter(plan => plan.isActive);
  const inactivePlans = plans.filter(plan => !plan.isActive);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading benefit plans...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6" />
            Benefits Administration
          </h2>
          <p className="text-muted-foreground">
            Manage benefit plans and enrollments for {companyName}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans.length}</div>
            <p className="text-xs text-muted-foreground">Available for enrollment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.reduce((sum, plan) => sum + plan.enrollmentCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${plans.reduce((sum, plan) => sum + (plan.monthlyCost * plan.enrollmentCount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total benefits spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">Of eligible employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Plans ({activePlans.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Plans ({inactivePlans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlanIcon(plan.planType)}
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.provider}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setEditingPlan(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTogglePlanStatus(plan.id, true)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                    <p className="text-lg font-semibold">${plan.monthlyCost}</p>
                    <p className="text-xs text-muted-foreground">
                      Employer pays: ${plan.employerContribution}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enrollments</p>
                    <p className="text-lg font-semibold">{plan.enrollmentCount} employees</p>
                    <p className="text-xs text-muted-foreground">
                      Total cost: ${(plan.monthlyCost * plan.enrollmentCount).toLocaleString()}/mo
                    </p>
                  </div>
                  {plan.deductible && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Deductible</p>
                      <p className="text-lg font-semibold">${plan.deductible}</p>
                      <p className="text-xs text-muted-foreground">Annual</p>
                    </div>
                  )}
                  {plan.outOfPocketMax && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Out of Pocket Max</p>
                      <p className="text-lg font-semibold">${plan.outOfPocketMax}</p>
                      <p className="text-xs text-muted-foreground">Annual</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{plan.coverage}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          {activePlans.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Plans</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first benefit plan to get started
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactivePlans.map((plan) => (
            <Card key={plan.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlanIcon(plan.planType)}
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.provider}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Inactive</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTogglePlanStatus(plan.id, false)}
                    >
                      Reactivate
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {inactivePlans.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No inactive plans</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Benefit Plan</DialogTitle>
            <DialogDescription>
              Add a new benefit plan for your employees
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Health Insurance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select 
                  value={formData.planType}
                  onValueChange={(value) => setFormData({ ...formData, planType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health Insurance</SelectItem>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="vision">Vision</SelectItem>
                    <SelectItem value="life">Life Insurance</SelectItem>
                    <SelectItem value="disability">Disability</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., Blue Cross Blue Shield"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverage">Coverage Level</Label>
                <Input
                  id="coverage"
                  value={formData.coverage}
                  onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                  placeholder="e.g., Comprehensive"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyCost">Monthly Cost ($)</Label>
                <Input
                  id="monthlyCost"
                  type="number"
                  value={formData.monthlyCost}
                  onChange={(e) => setFormData({ ...formData, monthlyCost: e.target.value })}
                  placeholder="450"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employerContribution">Employer Contribution ($)</Label>
                <Input
                  id="employerContribution"
                  type="number"
                  value={formData.employerContribution}
                  onChange={(e) => setFormData({ ...formData, employerContribution: e.target.value })}
                  placeholder="350"
                />
              </div>
            </div>

            {(formData.planType === 'health' || formData.planType === 'dental') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deductible">Annual Deductible ($)</Label>
                  <Input
                    id="deductible"
                    type="number"
                    value={formData.deductible}
                    onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outOfPocketMax">Out of Pocket Max ($)</Label>
                  <Input
                    id="outOfPocketMax"
                    type="number"
                    value={formData.outOfPocketMax}
                    onChange={(e) => setFormData({ ...formData, outOfPocketMax: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the key features and coverage of this plan..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={!formData.name || !formData.provider}>
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}