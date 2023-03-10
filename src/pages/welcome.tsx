import { type GetServerSideProps, type NextPage } from 'next';
import { type Dispatch, type SetStateAction, useState, type FC } from 'react';
import Button from '@ui/Button';
import TileButton from '@ui/TileButton';
import { getServerAuthSession } from '../server/auth';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useError } from '../hooks/useError';
import { api } from '../utils/api';
import type { roles } from '../constants/constants';
import cn from '../lib/classes';
import Loading from '@ui/Loading';
import { NextSeo } from 'next-seo';
import { splitAndCapitilize } from '../utils/helpers';

type Role = (typeof roles)[number];

const Welcome: NextPage = () => {
  const [checkedRoles, setCheckedRoles] = useState<Role[]>([]);
  const { setError, Error } = useError();

  const { mutate: assignRoles, isLoading } = api.user.assignRoles.useMutation({
    onError(err) {
      setError(err.message);
    },
    onSuccess() {
      window.location.reload();
    },
  });

  function proceed() {
    if (checkedRoles.length === 0) {
      setError('Please select at least one role.');
      return;
    }

    assignRoles(checkedRoles);
  }

  return (
    <>
      <NextSeo title='Welcome' />
      <main className='flex min-h-screen w-screen flex-col items-center justify-center bg-slate-900 text-slate-50'>
        <div className='flex flex-col items-center gap-2 sm:gap-4'>
          <h1 className='text-4xl sm:text-5xl'>Welcome!</h1>
          <p className='text-base text-slate-300'>
            Pick your roles to start, you can&apos;t change them later
          </p>
        </div>
        <div className='mt-12 flex w-11/12 max-w-2xl flex-col gap-6'>
          <div className='flex w-full flex-wrap gap-4'>
            <RoleButton
              title='driver'
              description='Attend and schedule races, post results'
              roles={checkedRoles}
              setRoles={setCheckedRoles}
            />
            <RoleButton
              title='manager'
              description='create teams, schedule endurance events, see drivers results'
              roles={checkedRoles}
              setRoles={setCheckedRoles}
            />
            <RoleButton
              title='socialMedia'
              description='see all events from teams and their results'
              roles={checkedRoles}
              setRoles={setCheckedRoles}
            />
          </div>
          <Error className='ml-auto' />
          <Button
            intent='primary'
            gap={isLoading ? 'normal' : 'small'}
            className='ml-auto overflow-hidden'
            onClick={() => proceed()}
            disabled={isLoading}
          >
            <span>Proceed</span>
            {isLoading ? (
              <Loading />
            ) : (
              <ArrowRightIcon
                className={cn('h-6 w-6 text-slate-50', {
                  'text-slate-400': isLoading,
                })}
              />
            )}
          </Button>
        </div>
      </main>
    </>
  );
};

const RoleButton: FC<{
  title: Role;
  description: string;
  roles: Role[];
  setRoles: Dispatch<SetStateAction<Role[]>>;
}> = ({ title, description, roles, setRoles }) => {
  return (
    <TileButton
      size='big'
      className='w-full sm:w-[calc(50%_-_0.5rem)]'
      checked={roles.includes(title)}
      onClick={() =>
        setRoles(prev =>
          prev.includes(title)
            ? prev.filter(role => role !== title)
            : [...prev, title]
        )
      }
    >
      <span className='text-2xl font-semibold tracking-wide'>
        {splitAndCapitilize(title)}
      </span>
      <span className='text-base'>{description}</span>
    </TileButton>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (session.user?.roles && session?.user?.roles?.length !== 0) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Welcome;
