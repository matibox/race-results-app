import dayjs from 'dayjs';
import { z } from 'zod';
import { eventTypes } from '../../../constants/constants';
import {
  createTRPCRouter,
  driverProcedure,
  managerProcedure,
  protectedProcedure,
} from '../trpc';

const createChampionshipSchema = z.object({
  title: z.string().nullable(),
  date: z.date(),
  type: z.enum(eventTypes),
  car: z.string(),
  track: z.string(),
  duration: z.number(),
  managerId: z.string().optional(),
  drivers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
      })
    )
    .nullable(),
});

export const eventRouter = createTRPCRouter({
  createChampionshipEvent: protectedProcedure
    .input(
      createChampionshipSchema.merge(
        z.object({
          championshipId: z.string(),
          managerId: z.string().optional(),
          teamId: z.string().nullable(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const { drivers, ...data } = input;
      return await ctx.prisma.event.create({
        data: {
          ...data,
          drivers: {
            connect:
              drivers && drivers.length > 0
                ? drivers.map(driver => ({ id: driver.id }))
                : {
                    id: ctx.session.user.id,
                  },
          },
        },
      });
    }),
  createOneOffEvent: protectedProcedure
    .input(createChampionshipSchema)
    .mutation(async ({ ctx, input }) => {
      const { drivers, type, managerId, ...data } = input;
      let teamId: string | undefined;

      if (type === 'endurance') {
        teamId = (
          await ctx.prisma.team.findUnique({
            where: { managerId: ctx.session.user.id },
            select: { id: true },
          })
        )?.id;
      }

      return await ctx.prisma.event.create({
        data: {
          ...data,
          type,
          drivers: {
            connect:
              drivers && drivers.length > 0
                ? drivers.map(driver => ({ id: driver.id }))
                : {
                    id: ctx.session.user.id,
                  },
          },
          manager:
            type === 'endurance' && managerId
              ? {
                  connect: { id: managerId },
                }
              : undefined,
          team: teamId ? { connect: { id: teamId } } : undefined,
        },
      });
    }),
  getDrivingEvents: driverProcedure
    .input(z.object({ monthIndex: z.number() }))
    .query(async ({ ctx, input }) => {
      const { monthIndex } = input;
      return await ctx.prisma.event.findMany({
        where: {
          AND: [
            { drivers: { some: { id: ctx.session.user.id } } },
            {
              date: {
                gte: new Date(dayjs().year(), monthIndex, 1),
                lt: new Date(
                  dayjs().year(),
                  monthIndex,
                  dayjs(new Date(dayjs().year(), monthIndex)).daysInMonth() + 1
                ),
              },
            },
          ],
        },
        include: {
          drivers: { select: { id: true, name: true } },
          championship: { select: { organizer: true, name: true } },
          result: true,
        },
        orderBy: { date: 'asc' },
      });
    }),
  getManagingEvents: managerProcedure
    .input(z.object({ monthIndex: z.number() }))
    .query(async ({ ctx, input }) => {
      const { monthIndex } = input;
      return await ctx.prisma.event.findMany({
        where: {
          AND: [
            { managerId: ctx.session.user.id },
            {
              date: {
                gte: new Date(dayjs().year(), monthIndex, 1),
                lt: new Date(
                  dayjs().year(),
                  monthIndex,
                  dayjs(new Date(dayjs().year(), monthIndex)).daysInMonth() + 1
                ),
              },
            },
          ],
        },
        include: {
          drivers: { select: { id: true, name: true } },
          championship: { select: { organizer: true, name: true } },
          result: true,
        },
        orderBy: { date: 'asc' },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.event.delete({
        where: { id: input.eventId },
      });
    }),
});
