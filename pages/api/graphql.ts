import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "@apollo/client";
import { schemas } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";
import prisma from "@/lib/prisma";

const BaseSchema = gql`
  type Query {
    test: Boolean
  }
  type Mutation {
    test: Boolean
  }
`;

const BaseResolvers = {
  Query: {
    test: () => true,
  },
  Mutation: {
    test: () => true,
  },
};

const apolloServer = new ApolloServer({
  typeDefs: [BaseSchema, ...schemas],
  resolvers: [BaseResolvers, ...resolvers],
  introspection: true,
});
export default startServerAndCreateNextHandler(apolloServer, {
  context: async () => {
    return { prisma };
  },
});
