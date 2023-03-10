import {
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import { AnimatePresence } from 'framer-motion';
import { type FC } from 'react';
import cn from '../../../lib/classes';
import { useTeamResultsStore } from '../../../store/useTeamResultsStore';
import ResultsSorting from './Sorting';

type ResultsHeaderProps = {
  noResults: boolean;
};

const ResultsHeader: FC<ResultsHeaderProps> = ({ noResults }) => {
  const {
    current,
    incrementMonth,
    decrementMonth,
    sorting: { toggle, isOpened },
  } = useTeamResultsStore();

  return (
    <>
      <div className='flex items-center justify-center gap-4'>
        <h1 className='hidden gap-2 text-xl sm:inline-flex sm:items-center lg:gap-3'>
          <DocumentChartBarIcon className='h-6' />
          <span>Team results</span>
        </h1>
        <div className='flex w-[10.5rem] items-center gap-4 sm:ml-auto'>
          <Button
            intent='secondary'
            size='xs'
            onClick={decrementMonth}
            aria-label='Previous month'
          >
            <ChevronLeftIcon className='h-6' />
          </Button>
          <h2 className='flex-1 text-center text-lg font-semibold'>
            {current.format('MMM YYYY')}
          </h2>
          <Button
            intent='secondary'
            size='xs'
            onClick={incrementMonth}
            aria-label='Next month'
          >
            <ChevronRightIcon className='h-6' />
          </Button>
        </div>
        {!noResults && (
          <Button
            intent='secondary'
            size='xs'
            className={cn('h-7 w-7', {
              'bg-slate-600 ring-slate-500': isOpened,
            })}
            onClick={toggle}
          >
            <AdjustmentsHorizontalIcon className='h-5' />
          </Button>
        )}
      </div>
      <AnimatePresence>
        {isOpened && !noResults && <ResultsSorting />}
      </AnimatePresence>
    </>
  );
};

export default ResultsHeader;
