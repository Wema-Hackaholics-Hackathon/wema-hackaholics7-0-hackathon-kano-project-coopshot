// app/dashboard/societies/[id]/ledger/page.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconCalendar,
  IconArrowDown,
  IconArrowUp,
  IconAlertCircle,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';
import SocietyHeader from '@/components/society-header';
import RightAside from '@/components/right-aside';
import {
  getSocietyLedger,
  getMyPenalties,
  getNextDueDate,
} from '@/app/actions/societies';
import {
  LedgerPageData,
  NextDueDateResponse,
  PenaltiesResponse,
  SocietyProps,
} from '@/types';
import { MakeContributionModal } from '@/components/make-contribution-modal';

export default async function SocietyLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch all data in parallel
  const [ledgerData, penaltiesData, dueDateData] = await Promise.all([
    getSocietyLedger(id),
    getMyPenalties(id),
    getNextDueDate(id),
  ]);

  const { society, ledger, summary }: LedgerPageData = ledgerData;
  const { summary: penaltySummary, penalties }: PenaltiesResponse =
    penaltiesData;
  const { next_due_date, days_until_due }: NextDueDateResponse = dueDateData;

  const isOverdue = days_until_due < 0;
  const isDueSoon = days_until_due >= 0 && days_until_due <= 3;
  const roundedDays = Math.abs(Math.round(days_until_due));

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <SocietyHeader society={society} />

      <div className='container max-w-7xl mx-auto px-6 py-6 flex-1'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Main Content - Ledger */}
          <div className='lg:col-span-7 xl:col-span-8 space-y-8'>
            {/* Enhanced Summary Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
              {/* Total Contributed */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Contributed
                  </CardTitle>
                  <IconArrowUp className='h-5 w-5 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    ₦{summary.total_contributed.toLocaleString()}
                  </div>
                  <p className='text-xs text-muted-foreground'>All time</p>
                </CardContent>
              </Card>

              {/* Total Payouts */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Payouts
                  </CardTitle>
                  <IconArrowDown className='h-5 w-5 text-blue-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    ₦{summary.total_payouts.toLocaleString()}
                  </div>
                  <p className='text-xs text-muted-foreground'>Received</p>
                </CardContent>
              </Card>

              {/* Current Balance */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Current Balance
                  </CardTitle>
                  <IconUsers className='h-5 w-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      summary.current_balance >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    ₦{Math.abs(summary.current_balance).toLocaleString()}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {summary.current_balance >= 0
                      ? 'Net contribution'
                      : 'Net received'}
                  </p>
                </CardContent>
              </Card>

              {/* Next Due Date */}
              <Card
                className={
                  isOverdue
                    ? 'border-red-500'
                    : isDueSoon
                    ? 'border-yellow-500'
                    : ''
                }
              >
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Next Due Date
                  </CardTitle>
                  <IconClock
                    className={`h-5 w-5 ${
                      isOverdue
                        ? 'text-red-600'
                        : isDueSoon
                        ? 'text-yellow-600'
                        : 'text-muted-foreground'
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {new Date(next_due_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      isOverdue
                        ? 'text-red-600'
                        : isDueSoon
                        ? 'text-yellow-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {isOverdue
                      ? `${roundedDays} day${
                          roundedDays === 1 ? '' : 's'
                        } overdue`
                      : roundedDays === 0
                      ? 'Due today'
                      : `${roundedDays} day${
                          roundedDays === 1 ? '' : 's'
                        } left`}
                  </p>
                </CardContent>
              </Card>

              {/* Penalties Owed */}
              <Card
                className={
                  penaltySummary.active_total > 0 ? 'border-red-500' : ''
                }
              >
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Penalties Owed
                  </CardTitle>
                  <IconAlertCircle
                    className={`h-5 w-5 ${
                      penaltySummary.active_total > 0
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      penaltySummary.active_total > 0 ? 'text-red-600' : ''
                    }`}
                  >
                    ₦{penaltySummary.active_total.toLocaleString()}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {penaltySummary.active_total > 0
                      ? `${penaltySummary.active_total} active`
                      : 'None'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History - Horizontal Scroll Inside Card */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Contributions & payouts record
                  </p>
                </div>
                <div className='w-auto'>
                  <MakeContributionModal
                    society={society}
                    trigger={
                      <Button size='sm' className='cursor-pointer font-medium'>
                        Make Contribution
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                {ledger.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <div className='rounded-full bg-muted/50 p-8 mb-6'>
                      <IconCalendar className='h-16 w-16 text-muted-foreground/50' />
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>
                      No transactions yet
                    </h3>
                    <p className='text-sm text-muted-foreground max-w-sm'>
                      Your contributions and payouts will appear here once the
                      cycle begins.
                    </p>
                  </div>
                ) : (
                  <div className='min-w-full overflow-hidden rounded-lg border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className='text-right'>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledger.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className='text-sm '>
                              {new Date(entry.created_at).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  entry.type === 'contribution'
                                    ? 'default'
                                    : entry.type === 'payout'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className='capitalize'
                              >
                                {entry.type.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground max-w-50 truncate'>
                              {entry.description || '—'}
                            </TableCell>
                            <TableCell className='text-right font-medium '>
                              {entry.type === 'payout' ? '-' : '+'}₦
                              {entry.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {/* <ScrollBar orientation='horizontal' /> */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Penalty History - Same Pattern */}
            <Card className='mt-8'>
              <CardHeader>
                <CardTitle>Penalty History</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  All penalties assessed on your contributions
                </p>
              </CardHeader>
              <CardContent>
                {penalties.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <div className='rounded-full bg-muted/50 p-8 mb-6'>
                      <IconAlertCircle className='h-16 w-16 text-muted-foreground/50' />
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>
                      No penalties recorded
                    </h3>
                    <p className='text-sm text-muted-foreground max-w-sm'>
                      Great job staying on top of your contributions!
                    </p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <div className='min-w-full overflow-hidden rounded-lg border'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className=''>
                              Date
                            </TableHead>
                            <TableHead className='whitespace-nowrap'>
                              Amount
                            </TableHead>
                            <TableHead className='whitespace-nowrap'>
                              Description
                            </TableHead>
                            <TableHead className='whitespace-nowrap'>
                              Status
                            </TableHead>
                            <TableHead className='whitespace-nowrap'>
                              Waived By
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {penalties.map((penalty) => (
                            <TableRow key={penalty.id}>
                              <TableCell className='text-sm whitespace-nowrap'>
                                {new Date(penalty.date).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )}
                              </TableCell>
                              <TableCell className='font-medium text-red-600 whitespace-nowrap'>
                                ₦{penalty.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className='text-sm text-muted-foreground max-w-50 truncate'>
                                {penalty.description || 'Late contribution'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    penalty.is_active
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                  className='capitalize'
                                >
                                  {penalty.is_active ? 'Active' : 'Waived'}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-sm whitespace-nowrap'>
                                {penalty.waived_by ? (
                                  <div>
                                    <p className='font-medium'>
                                      {penalty.waived_by}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                      {penalty.waived_at
                                        ? new Date(
                                            penalty.waived_at
                                          ).toLocaleDateString()
                                        : '—'}
                                    </p>
                                  </div>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <RightAside society={society} />
        </div>
      </div>
    </div>
  );
}
