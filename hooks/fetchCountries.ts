import { gql, useLazyQuery } from "@apollo/client";
import { Prisma } from "@prisma/client";

interface QueryData {
  countries: Country[];
}

type Country = Prisma.CountryGetPayload<{
  include: {
    history: true;
  };
}>;

interface QueryVars {
  query: Prisma.CountryWhereInput;
}
const GET_ALL_COUNTRIES = gql`
  query CountriesQuery {
    countries {
      area
      id
      country
      history {
        population
        year
      }
    }
  }
`;
function useFetchCountries() {
  const [execute, { loading, error, data, refetch, called }] = useLazyQuery<
    QueryData,
    QueryVars
  >(GET_ALL_COUNTRIES, {
    notifyOnNetworkStatusChange: true,
  });

  const fetchCountries = async () => {
    try {
      const query: QueryVars = {
        query: {},
      };
      const response = called
        ? await refetch(query)
        : await execute({
            variables: query,
          });
      return response.data?.countries || [];
    } catch (e) {
      return [];
    }
  };

  return {
    fetchCountries,
    loading,
    error,
    countries: data?.countries || [],
    refetch,
  };
}

export default useFetchCountries;
