import { gql, useMutation } from "@apollo/client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import useFetchCountries from "@/hooks/fetchCountries";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Skeleton,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  CheckIcon,
  DeleteIcon,
  SmallAddIcon,
  SpinnerIcon,
} from "@chakra-ui/icons";
import { Prisma } from ".prisma/client";
import CountryGetPayload = Prisma.CountryGetPayload;

const statistic = (old?: number, current?: number) => {
  if (!old || !current) return null;
  if (!(Number.isFinite(old) && Number.isFinite(current))) return null;
  return ((current - old) / old) * 100;
};
const Country = ({
  country,
  fetchCountries,
  setCountry,
  index,
}: {
  country: CountryGetPayload<{ include: { history: true } }>;
  fetchCountries: () => Promise<
    CountryGetPayload<{ include: { history: true } }>[] | any[]
  >;
  setCountry: Dispatch<SetStateAction<number>>;
  index: number;
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [addRecordData, { loading: addLoading, error: addError }] =
    useMutation(addRecord);
  const [year, setYear] = useState("");
  const [population, setPopulation] = useState("");

  const handleSubmit = () => {
    addRecordData({
      variables: {
        id: country?.id,
        year: Number(year),
        population: Number(population),
      },
    })
      .catch()
      .then(() => fetchCountries().then(() => setCountry(index)));
  };
  return (
    <>
      <Box>
        <Flex justifyContent={"space-between"}>
          <Heading mb={4} size={"md"}>
            {country.country}
          </Heading>
          <IconButton
            aria-label={"Add Record"}
            icon={<SmallAddIcon />}
            onClick={onToggle}
          />
        </Flex>
        <Text fontSize="sm">
          Area: {country.area?.toLocaleString("en-US")} sq. km
        </Text>
      </Box>
      <Collapse in={isOpen} animateOpacity>
        <Box py="20px" mt="4" rounded="md" shadow="md">
          <form>
            {addError?.message && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>{addError.name}</AlertTitle>
                <AlertDescription>{addError.message}</AlertDescription>
              </Alert>
            )}
            <Flex gap={"2"} alignItems={"end"}>
              <FormControl isRequired>
                <FormLabel style={{ fontSize: "12px" }}>Year</FormLabel>
                <NumberInput
                  placeholder="Year"
                  value={year}
                  min={1970}
                  max={2023}
                  onChange={(valueString) => setYear(valueString)}
                  allowMouseWheel={true}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel style={{ fontSize: "12px" }}>Population</FormLabel>
                <NumberInput
                  step={1000}
                  onChange={(valueString) => setPopulation(parse(valueString))}
                  value={format(population)}
                  min={0}
                  allowMouseWheel={true}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <IconButton
                onClick={handleSubmit}
                colorScheme="green"
                aria-label="Create Country"
                icon={addLoading ? <SpinnerIcon /> : <CheckIcon />}
              />
            </Flex>
          </form>
        </Box>
      </Collapse>
      <Box>
        {country.history
          ?.slice(0)
          .reverse()
          .map(({ year, population }, index) => (
            <Card my={3} key={index}>
              <CardHeader>
                <Heading size="sm">
                  <Flex
                    alignItems="start"
                    gap="2"
                    justifyContent={"space-between"}
                    direction={"row"}
                  >
                    <Badge colorScheme="green">{year}</Badge>

                    {index != 0 &&
                      Number.isFinite(
                        statistic(
                          country.history?.slice(0).reverse()[index - 1]
                            ?.population,
                          population
                        )
                      ) && (
                        <StatGroup>
                          <Stat>
                            <StatHelpText>
                              <StatArrow
                                type={
                                  statistic(
                                    country.history?.slice(0).reverse()[
                                      index - 1
                                    ]?.population,
                                    population
                                  )! > 0
                                    ? "increase"
                                    : "decrease"
                                }
                              />
                              {statistic(
                                country.history?.slice(0).reverse()[index - 1]
                                  ?.population,
                                population
                              )?.toFixed(2)}
                              %
                            </StatHelpText>
                          </Stat>
                        </StatGroup>
                      )}
                  </Flex>
                </Heading>
              </CardHeader>
              <CardBody>
                <Text>Population: {population.toLocaleString("en-US")}</Text>
              </CardBody>
            </Card>
          ))}
      </Box>
    </>
  );
};

const createCountry = gql`
  mutation ($country: String!, $area: Float) {
    createCountry(country: $country, area: $area) {
      id
    }
  }
`;

const addRecord = gql`
  mutation ($id: String!, $year: Int!, $population: Int!) {
    addRecord(id: $id, year: $year, population: $population) {
      id
    }
  }
`;

const deleteCountry = gql`
  mutation ($id: String!) {
    deleteCountry(id: $id) {
      id
    }
  }
`;

const format = (val: string) => Number(parse(val)).toLocaleString("en-US");
const parse = (val: string) => val.replace(/^,/, "");
export default function Countries() {
  const { fetchCountries, countries, loading, refetch } = useFetchCountries();
  const [country, selectCountry] = useState(undefined as unknown as number);
  const [deletedCountry, selectDCountry] = useState(
    undefined as unknown as number
  );
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  const { isOpen: deleteOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const handleChange = (event: any) => setName(event.target.value);
  const [area, setValue] = useState("");
  const [name, setName] = useState("");

  // const [error, setError] = useState("")
  const [createCountryData, { loading: createLoading, error: CreationError }] =
    useMutation(createCountry);
  const [deleteCountryData, {}] = useMutation(deleteCountry);

  const handleSubmit = () => {
    createCountryData({
      variables: {
        country: name,
        area: Number(area),
      },
    })
      .catch()
      .then(fetchCountries);
  };
  const handleDelete = () => {
    console.log(country);
    deleteCountryData({
      variables: {
        id: countries[deletedCountry].id,
      },
    })
      .catch()
      .then(onClose)
      .then(() => selectCountry(undefined as unknown as number))
      .then(fetchCountries);
  };
  useEffect(() => {
    fetchCountries().then(() => refetch());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);
  return (
    <Skeleton isLoaded={!loading}>
      <Grid
        templateAreas={`"header header"
                  "main aside"
                  "footer aside"`}
        gridTemplateRows={"0.2fr 1fr 0"}
        gridTemplateColumns={"1fr 260px"}
        h="fit-content"
        gap="5"
        color="blackAlpha.700"
        fontWeight="bold"
      >
        <GridItem pl="2" area={"header"}></GridItem>
        <GridItem
          bg={"gray.50"}
          style={{ borderRadius: "20px" }}
          p="2"
          area={"aside"}
        >
          {Number.isInteger(country) ? (
            <Country
              country={countries[country]}
              fetchCountries={fetchCountries}
              setCountry={selectCountry}
              index={country}
            />
          ) : (
            <>Select a country</>
          )}
        </GridItem>
        <GridItem pl="2" area={"main"}>
          <Button onClick={onToggle} colorScheme="green">
            Add a country
          </Button>
          <Collapse in={isOpen} animateOpacity>
            <Box p="20px" mt="4" rounded="md" shadow="md">
              <form>
                {CreationError?.message && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>{CreationError.name}</AlertTitle>
                    <AlertDescription>{CreationError.message}</AlertDescription>
                  </Alert>
                )}
                <Flex gap={"2"} alignItems={"end"}>
                  <FormControl isRequired>
                    <FormLabel>Country</FormLabel>
                    <Input
                      placeholder="Name of the country"
                      value={name}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Area</FormLabel>
                    <NumberInput
                      step={1000}
                      onChange={(valueString) => setValue(parse(valueString))}
                      value={format(area)}
                      min={0}
                      allowMouseWheel={true}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <IconButton
                    onClick={handleSubmit}
                    colorScheme="green"
                    aria-label="Create Country"
                    icon={createLoading ? <SpinnerIcon /> : <CheckIcon />}
                  />
                </Flex>
              </form>
            </Box>
          </Collapse>
          <Box>
            <TableContainer>
              <Table variant="simple">
                <TableCaption>Breakdown of Countries</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th isNumeric>Area (sq.km)</Th>
                    <Th isNumeric>Latest Population</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {countries.map((country, index) => (
                    <Tr onClick={() => selectCountry(index)} key={index}>
                      <Td>{country.country}</Td>
                      <Td isNumeric>{country.area?.toLocaleString("en-US")}</Td>
                      <Td isNumeric>
                        {country.history?.[0]?.population?.toLocaleString(
                          "en-US"
                        ) || "-"}
                      </Td>
                      <Td>
                        <IconButton
                          colorScheme={"red"}
                          icon={<DeleteIcon />}
                          onClick={() => {
                            selectDCountry(index);
                            onOpen();
                          }}
                          aria-label={"Delete Country"}
                        />
                        <AlertDialog
                          motionPreset="slideInBottom"
                          leastDestructiveRef={cancelRef}
                          onClose={onClose}
                          isOpen={deleteOpen}
                          isCentered
                        >
                          <AlertDialogOverlay />

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              Delete Country?
                            </AlertDialogHeader>
                            <AlertDialogCloseButton />
                            <AlertDialogBody>
                              This cannot be undone.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                              <Button ref={cancelRef} onClick={onClose}>
                                No
                              </Button>
                              <Button
                                colorScheme="red"
                                ml={3}
                                onClick={() => handleDelete()}
                              >
                                Yes
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </GridItem>
      </Grid>
    </Skeleton>
  );
}
