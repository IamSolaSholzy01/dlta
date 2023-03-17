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
  `,
  resolvers: {
    Query: {
      history: async (_, {}, ctx) => {
        return ctx.prisma.record.findMany();
      },
    },
    Mutation: {},
  },
};
