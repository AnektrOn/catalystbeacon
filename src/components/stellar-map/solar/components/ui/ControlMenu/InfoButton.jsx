import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from '@nextui-org/react';
import { IconInfoCircle } from '@tabler/icons-react';

export default function InfoButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button isIconOnly onPress={onOpen} color="secondary" variant="flat">
        <IconInfoCircle />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="opacity-90">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Solar System (HC University)</ModalHeader>
              <ModalBody>
                <p>Based on greengem/threejs-solar-system. Adapted for HC University Stellar Map.</p>
                <p>Use the planet menu at the bottom to zoom on a planet. Use the home button to return to full view.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
