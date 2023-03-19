import { gql, useMutation } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import useFetchRecords from "@/hooks/fetchRecords";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  Skeleton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";

const deleteRecord = gql`
  mutation ($id: String!) {
    deleteRecord(id: $id) {
      id
    }
  }
`;
export default function Records() {
  const { fetchRecords, records, loading, refetch } = useFetchRecords();
  const cancelRef = useRef(null);
  const { isOpen: deleteOpen, onOpen, onClose } = useDisclosure();
  const [record, selectRecord] = useState(undefined as unknown as number);
  const [deleteRecordData, {}] = useMutation(deleteRecord);
  const router = useRouter();
  const handleDelete = () => {
    deleteRecordData({
      variables: {
        id: records[record].id,
      },
    })
      .catch()
      .then(onClose)
      .then(() => selectRecord(undefined as unknown as number))
      .then(fetchRecords);
  };

  useEffect(() => {
    fetchRecords().then(() => refetch());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);
  return (
    <Skeleton isLoaded={!loading}>
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Breakdown of Records</TableCaption>
          <Thead>
            <Tr>
              <Th>Year</Th>
              <Th isNumeric>Country</Th>
              <Th isNumeric>Population</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {records.map((record, index) => (
              <Tr key={index}>
                <Td>{record.year}</Td>
                <Td isNumeric>{record.country.country}</Td>
                <Td isNumeric>
                  {record.population?.toLocaleString("en-US") || "-"}
                </Td>
                <Td>
                  <IconButton
                    colorScheme={"red"}
                    icon={<DeleteIcon />}
                    onClick={() => {
                      selectRecord(index);
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
                      <AlertDialogHeader>Delete Record?</AlertDialogHeader>
                      <AlertDialogCloseButton />
                      <AlertDialogBody>This cannot be undone.</AlertDialogBody>
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
    </Skeleton>
  );
}
