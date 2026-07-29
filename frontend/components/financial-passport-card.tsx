'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FinancialPassport } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconIdBadge2,
  IconAward,
  IconCheck,
  IconLock,
  IconDownload,
  IconShare,
  IconTrendingUp,
  IconBuildingBank,
  IconHistory,
  IconBuildingStore,
  IconShield,
  IconSparkles,
  IconPrinter,
  IconQrcode,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface FinancialPassportCardProps {
  passport: FinancialPassport;
}

export function FinancialPassportCard({ passport }: FinancialPassportCardProps) {
  const [showCertificate, setShowCertificate] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://coopshot.app/verify/passport/${passport.user_id}`);
      toast.success('Verification Link Copied!', {
        description: 'You can share your verified passport link with banks and financial partners.',
      });
    }
  };

  const handlePrint = () => {
    toast.success('Downloading Official Certificate...', {
      description: 'Your verified CoopShot Financial Passport PDF has been generated.',
    });
  };

  // Calculate composite score
  const overallScore = Math.round(
    (passport.consistency_score +
      passport.repayment_score +
      passport.discipline_score +
      passport.investment_score) / 4
  );

  return (
    <div className='space-y-8 max-w-5xl mx-auto'>
      {/* Top Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='rounded-xl border bg-card p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden'
      >
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10'>
          <div className='space-y-2.5 max-w-xl'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary'>
              <IconIdBadge2 className='h-4 w-4' />
              CoopShot Verified Financial Passport
            </div>
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
              {passport.user_name}
            </h1>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Portable financial reputation and contribution track record verified across{' '}
              <strong className='text-foreground font-semibold'>
                {passport.verified_cooperatives_count} cooperative societies
              </strong>.
            </p>
          </div>

          <div className='flex items-center gap-4 shrink-0'>
            <Image
              src='/illustrations/undraw_contract-signed_vutk.svg'
              alt='Verified Passport'
              width={140}
              height={110}
              className='h-24 w-auto hidden xl:block shrink-0'
            />
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto'>
              <Button
                onClick={() => setShowCertificate(true)}
                className='font-semibold shadow-xs cursor-pointer'
              >
                <IconDownload className='mr-2 h-4 w-4' />
                Export Passport Certificate
              </Button>
              <Button
                onClick={handleShare}
                variant='outline'
                className='cursor-pointer font-medium'
              >
                <IconShare className='mr-2 h-4 w-4' />
                Share Link
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Current Trust Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className='md:col-span-1 flex flex-col'
        >
          <Card className='flex-1 flex flex-col justify-between border bg-card shadow-xs'>
            <CardHeader className='pb-2'>
              <CardDescription className='text-xs font-medium uppercase tracking-wider'>
                Current Trust Tier
              </CardDescription>
              <CardTitle className='text-2xl font-bold flex items-center gap-2 text-foreground'>
                <IconAward className='h-6 w-6 text-amber-500 shrink-0' />
                {passport.trust_level}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 pt-2 flex-1 flex flex-col justify-between'>
              <div className='space-y-2'>
                <Badge variant='secondary' className='px-3 py-1 font-semibold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                  ✓ {passport.trust_status}
                </Badge>
                <div className='pt-2'>
                  <div className='text-xs text-muted-foreground'>Overall Trust Score</div>
                  <div className='flex items-baseline gap-2 mt-1'>
                    <span className='text-4xl font-extrabold text-foreground'>{overallScore}</span>
                    <span className='text-sm text-muted-foreground font-semibold'>/ 100</span>
                  </div>
                </div>
              </div>

              <div className='space-y-2.5 pt-4 border-t text-xs'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Member Since:</span>
                  <span className='font-semibold text-foreground'>{passport.member_since}</span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Completed Cycles:</span>
                  <span className='font-semibold text-foreground'>{passport.completed_cycles} cycles</span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Total Savings:</span>
                  <span className='font-bold text-foreground text-sm'>
                    ₦{passport.total_savings.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Total Contributions:</span>
                  <span className='font-semibold text-foreground'>
                    ₦{passport.total_contributions.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Investment Yield Earned:</span>
                  <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    +₦{passport.total_investment_returns.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Trust Profile Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className='md:col-span-2'
        >
          <Card className='h-full shadow-xs'>
            <CardHeader>
              <CardTitle className='text-lg font-bold flex items-center gap-2'>
                <IconTrendingUp className='h-5 w-5 text-primary' />
                Financial Trust Behavior Ratings
              </CardTitle>
              <CardDescription className='text-xs'>
                Quantitative metrics computed from verified cooperative savings and repayment discipline.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-5'>
              {/* Savings Consistency */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-sm font-medium'>
                  <span>Savings Consistency</span>
                  <span className='font-bold text-primary'>{passport.consistency_score}%</span>
                </div>
                <Progress value={passport.consistency_score} className='h-2 bg-muted' />
                <p className='text-xs text-muted-foreground'>
                  Regular monthly deposits made without missing scheduled cycles.
                </p>
              </div>

              {/* Payment Reliability */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-sm font-medium'>
                  <span>Payment Reliability</span>
                  <span className='font-bold text-primary'>
                    {passport.repayment_score}%
                  </span>
                </div>
                <Progress value={passport.repayment_score} className='h-2 bg-muted' />
                <p className='text-xs text-muted-foreground'>
                  Share of payment attempts — registration fees and monthly dues — that succeeded.
                </p>
              </div>

              {/* Savings Discipline */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-sm font-medium'>
                  <span>Savings Target Adherence</span>
                  <span className='font-bold text-primary'>
                    {passport.discipline_score}%
                  </span>
                </div>
                <Progress value={passport.discipline_score} className='h-2 bg-muted' />
                <p className='text-xs text-muted-foreground'>
                  Adherence to agreed target contribution benchmarks over time.
                </p>
              </div>

              {/* Investment Participation */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-sm font-medium'>
                  <span>Treasury Bill Investment Participation</span>
                  <span className='font-bold text-primary'>
                    {passport.investment_score}%
                  </span>
                </div>
                <Progress value={passport.investment_score} className='h-2 bg-muted' />
                <p className='text-xs text-muted-foreground'>
                  Active participation in collective 5% Treasury Bill investment allocations.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Philosophical Callout Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className='rounded-xl border bg-muted/40 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4'
      >
        <div className='p-3 rounded-xl bg-background border text-primary shrink-0 shadow-2xs'>
          <IconBuildingBank className='h-6 w-6' />
        </div>
        <div className='space-y-1'>
          <h4 className='font-semibold text-foreground text-base'>
            Your financial history shouldn&apos;t disappear because it happened outside traditional banking.
          </h4>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            CoopShot bridges traditional cooperative trust with formal financial opportunities, giving you a portable reputation that banks, insurers, and credit partners recognize.
          </p>
        </div>
      </motion.div>

      {/* Tabled Passport Sections */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs defaultValue='milestones' className='w-full space-y-6'>
          <TabsList className='grid w-full grid-cols-3 max-w-md'>
            <TabsTrigger value='milestones' className='text-xs font-semibold cursor-pointer'>
              <IconHistory className='mr-1.5 h-3.5 w-3.5' /> Milestones
            </TabsTrigger>
            <TabsTrigger value='cooperatives' className='text-xs font-semibold cursor-pointer'>
              <IconBuildingStore className='mr-1.5 h-3.5 w-3.5' /> Cooperatives
            </TabsTrigger>
            <TabsTrigger value='opportunities' className='text-xs font-semibold cursor-pointer'>
              <IconSparkles className='mr-1.5 h-3.5 w-3.5' /> Unlocked Perks
            </TabsTrigger>
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value='milestones'>
            <Card className='shadow-xs'>
              <CardHeader>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                  <IconHistory className='h-5 w-5 text-primary' />
                  Financial Reputation Milestones
                </CardTitle>
                <CardDescription className='text-xs'>
                  Key track record achievements unlocked through consistent participation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border'>
                  {passport.milestones.map((milestone) => (
                    <div key={milestone.id} className='relative flex items-start gap-4 group'>
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                          milestone.completed
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-muted-foreground/40'
                        }`}
                      >
                        {milestone.completed ? (
                          <IconCheck className='h-3.5 w-3.5' />
                        ) : (
                          <IconLock className='h-3 w-3' />
                        )}
                      </div>

                      <div className='flex-1 space-y-1 bg-card p-4 rounded-lg border shadow-2xs'>
                        <div className='flex items-center justify-between gap-2 flex-wrap'>
                          <h5 className='font-semibold text-sm text-foreground'>
                            {milestone.title}
                          </h5>
                          {milestone.completed && milestone.completed_at && (
                            <Badge variant='outline' className='text-xs text-muted-foreground'>
                              {milestone.completed_at}
                            </Badge>
                          )}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verified Cooperatives Tab */}
          <TabsContent value='cooperatives'>
            <Card className='shadow-xs'>
              <CardHeader>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                  <IconBuildingStore className='h-5 w-5 text-primary' />
                  Verified Cooperative Affiliations ({passport.verified_cooperatives_count})
                </CardTitle>
                <CardDescription className='text-xs'>
                  Registered societies confirming member reputation and contribution history.
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-2'>
                <div className='rounded-xl border bg-card p-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-semibold text-sm text-foreground'>
                      Victoria Island Savers Guild
                    </h4>
                    <Badge variant='default' className='bg-emerald-600 text-white text-[11px]'>
                      Verified Active
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Monthly rotating credit group with 12 active members. 100% on-time record.
                  </p>
                  <div className='text-xs pt-2 border-t flex justify-between font-medium text-muted-foreground'>
                    <span>Role: Founder</span>
                    <span className='text-foreground font-bold'>₦300,000 / month</span>
                  </div>
                </div>

                <div className='rounded-xl border bg-card p-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-semibold text-sm text-foreground'>
                      Tech Founders Investment Circle
                    </h4>
                    <Badge variant='default' className='bg-emerald-600 text-white text-[11px]'>
                      Verified Active
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Quarterly investment pooling group. Active 5% T-Bill allocation participant.
                  </p>
                  <div className='text-xs pt-2 border-t flex justify-between font-medium text-muted-foreground'>
                    <span>Role: Co-Founder</span>
                    <span className='text-foreground font-bold'>₦500,000 / quarter</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unlocked Perks Tab */}
          <TabsContent value='opportunities'>
            <Card className='shadow-xs'>
              <CardHeader>
                <CardTitle className='text-lg font-bold flex items-center gap-2'>
                  <IconSparkles className='h-5 w-5 text-amber-500' />
                  Institutional Access & Unlocked Perks
                </CardTitle>
                <CardDescription className='text-xs'>
                  Financial products accessible through your Level 3 Trust Tier reputation.
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-3'>
                <div className='rounded-xl border p-4 bg-card space-y-2'>
                  <div className='p-2 rounded-lg bg-primary/10 text-primary w-fit'>
                    <IconBuildingBank className='h-5 w-5' />
                  </div>
                  <h4 className='font-semibold text-sm'>Cooperative Business Line</h4>
                  <p className='text-xs text-muted-foreground'>
                    Access up to ₦1,500,000 low-interest working capital without physical collateral.
                  </p>
                </div>

                <div className='rounded-xl border p-4 bg-card space-y-2'>
                  <div className='p-2 rounded-lg bg-primary/10 text-primary w-fit'>
                    <IconTrendingUp className='h-5 w-5' />
                  </div>
                  <h4 className='font-semibold text-sm'>Treasury Bill Auto-Pool</h4>
                  <p className='text-xs text-muted-foreground'>
                    Automatic allocation into CBN high-yield 91-day Treasury Bills at institutional rates.
                  </p>
                </div>

                <div className='rounded-xl border p-4 bg-card space-y-2'>
                  <div className='p-2 rounded-lg bg-primary/10 text-primary w-fit'>
                    <IconShield className='h-5 w-5' />
                  </div>
                  <h4 className='font-semibold text-sm'>Group Micro-Insurance</h4>
                  <p className='text-xs text-muted-foreground'>
                    Comprehensive health & emergency coverage underwritten by Leadway Assurance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Export Passport Certificate Dialog */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
              <IconIdBadge2 className='h-5 w-5 text-primary' />
              CoopShot Verified Financial Passport
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Official printable financial reputation certificate.
            </DialogDescription>
          </DialogHeader>

          <div className='rounded-xl border-2 border-primary/20 bg-card p-6 space-y-6 shadow-xs relative'>
            <div className='flex items-start justify-between gap-4 border-b pb-4'>
              <div>
                <h3 className='text-xl font-bold text-foreground'>{passport.user_name}</h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Passport ID: <span className='font-mono font-semibold text-foreground'>ASU-8492-9012</span>
                </p>
              </div>
              <Badge variant='default' className='bg-primary text-primary-foreground font-bold text-xs'>
                {passport.trust_level}
              </Badge>
            </div>

            <div className='grid grid-cols-2 gap-4 text-xs'>
              <div>
                <span className='text-muted-foreground block'>Overall Trust Score</span>
                <span className='font-bold text-lg text-foreground'>{overallScore} / 100</span>
              </div>
              <div>
                <span className='text-muted-foreground block'>Verified Cooperatives</span>
                <span className='font-bold text-lg text-foreground'>{passport.verified_cooperatives_count} Societies</span>
              </div>
              <div>
                <span className='text-muted-foreground block'>Total Verified Savings</span>
                <span className='font-bold text-foreground'>₦{passport.total_savings.toLocaleString()}</span>
              </div>
              <div>
                <span className='text-muted-foreground block'>Repayment Record</span>
                <span className='font-bold text-emerald-600 dark:text-emerald-400'>100% On-Time</span>
              </div>
            </div>

            <div className='pt-4 border-t flex items-center justify-between gap-4 text-[11px] text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <IconQrcode className='h-10 w-10 text-foreground shrink-0' />
                <div>
                  <p className='font-medium text-foreground'>Cryptographic Verification</p>
                  <p className='font-mono text-[10px]'>Hash: 0x94f82...b38a</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-foreground'>CoopShot Network Authority</p>
                <p>Issued: March 2026</p>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 pt-2'>
            <Button variant='outline' onClick={() => setShowCertificate(false)} className='cursor-pointer'>
              Close
            </Button>
            <Button onClick={handlePrint} className='cursor-pointer font-semibold'>
              <IconPrinter className='mr-1.5 h-4 w-4' /> Download PDF / Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
