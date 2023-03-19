import { gql } from "@apollo/client";

export const CountryComponent = {
  schema: gql`
    type Country {
      id: ID!
      createdAt: String
      country: String
      area: Float
      history: [Record]
    }
    extend type Query {
      countries: [Country]
      country(id: String!): Country
    }
    extend type Mutation {
      createCountry(country: String!, area: Float): Country
      addRecord(id: String!, year: Int!, population: Int!): Record
      deleteCountry(id: String!): Country
    }
  `,
  resolvers: {
    Query: {
      countries: (_: any, {}: any, ctx: any) => {
        return ctx.prisma.country.findMany({
          include: {
            history: {
              orderBy: {
                year: "desc",
              },
            },
          },
        });
      },
      country: (_: any, { id }: { id: string }, ctx: any) => {
        return ctx.prisma.country.findUnique({
          where: { id },
          include: { history: true },
        });
      },
    },
    Mutation: {
      createCountry: (
        _: any,
        data: { country: string; area: string },
        ctx: any
      ) => {
        return ctx.prisma.country.create({
          data,
        });
      },
      addRecord: async (
        _: any,
        {
          id,
          year,
          population,
        }: { id: string; year: number; population: number },
        ctx: any
      ) => {
        const existing = await ctx.prisma.record.findMany({
          where: { countryId: id, year },
        });
        if (existing.length)
          return ctx.prisma.record.update({
            where: { id: existing[0].id },
            data: {
              population,
            },
          });
        return ctx.prisma.country.update({
          where: { id },
          data: {
            history: {
              create: [
                {
                  year,
                  population,
                },
              ],
            },
          },
        });
      },
      deleteCountry: (_: any, { id }: { id: string }, ctx: any) => {
        return ctx.prisma.country.delete({
          where: { id },
        });
      },
    },
  },
};
