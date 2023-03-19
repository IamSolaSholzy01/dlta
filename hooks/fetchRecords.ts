import { gql, useLazyQuery } from "@apollo/client";
import { Prisma } from "@prisma/client";

interface QueryData {
  history: Record[];
}

type Record = Prisma.RecordGetPayload<{
  include: {
    country: true;
  };
}>;

interface QueryVars {
  query: Prisma.RecordWhereInput;
}

const GET_ALL_RECORDS = gql`
  query RecordsQuery {
    history {
      countryId
      population
      year
      id
      country {
        area
        country
        createdAt
        id
      }
    }
  }
`;
function useFetchRecords() {
  const [execute, { loading, error, data, refetch, called }] = useLazyQuery<
    QueryData,
    QueryVars
  >(GET_ALL_RECORDS, {
    notifyOnNetworkStatusChange: true,
  });

  const fetchRecords = async () => {
    try {
      const query: QueryVars = {
        query: {},
      };

      const response = called
        ? await refetch(query)
        : await execute({
            variables: query,
          });
      return response.data?.history || [];
    } catch (e) {
      return [];
    }
  };

  return {
    fetchRecords,
    loading,
    error,
    records: data?.history || [],
    refetch,
  };
}

export default useFetchRecords;
