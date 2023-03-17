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
    }
  `,
  resolvers: {
    Query: {
      countries: async (_, {}, ctx) => {
        return ctx.prisma.country.findMany();
      },
    },
    Mutation: {},
  },
};
