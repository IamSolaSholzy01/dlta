import { gql } from "@apollo/client";

export const RecordsComponent = {
  schema: gql`
    type Record {
      id: ID!
      year: Int
      population: Int
      country: Country
      countryId: String
    }
    extend type Query {
      history: [Record]
    }
    extend type Mutation {
      deleteRecord(id: String!): Record
    }
  `,
  resolvers: {
    Query: {
      history: async (_: any, {}: any, ctx: any) => {
        return ctx.prisma.record.findMany({
          include: { country: true },
          orderBy: { year: "asc" },
        });
      },
    },
    Mutation: {
      deleteRecord: (_: any, { id }: { id: string }, ctx: any) => {
        return ctx.prisma.record.delete({
          where: { id },
        });
      },
    },
  },
};
