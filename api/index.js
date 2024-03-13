import { ApolloServer, gql } from "apollo-server";
import pkg from 'faunadb';
const { Client, Map, Paginate, Collection, Lambda, Get, Documents } = pkg;

const client = new Client({
    secret: 'fnAFcUs2BgAASX-dEaDkemV0SU_DE2OsqzTCfOGm',
    domain: 'db.us.fauna.com',
    port: 443,
    scheme: 'https',
});

const typeDefs = gql`
  type Carta {
    Titulo: String
    Promedio: Float
  }

  type Query {
    GetCartas: [Carta]
  }
`;

const resolvers = {
    Query: {
        GetCartas: async () => {
            const response = await client.query(
                Map(
                    Paginate(Documents(Collection('Cartas'))),
                    Lambda((x) => Get(x))
                )
            );

            // Extraemos solo los datos de los documentos
            const cartas = response.data.map(item => item.data);

            return cartas;
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
