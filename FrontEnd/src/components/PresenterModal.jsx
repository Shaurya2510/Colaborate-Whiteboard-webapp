import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Button from "./ui/button";

const PresenterModal = ({ isOpen, setIsOpen, users, user, socket }) => {
    const togglePermission = (usr) => {
        socket.emit("update-draw-permission", {
            roomId: user.id,
            targetUserId: usr.userId,
            canDraw: !usr.presenter,
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-40" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title className="text-lg font-medium text-gray-900">
                                Manage Drawing Permissions
                            </Dialog.Title>
                            <div className="mt-4 space-y-3">
                                {users
                                    .filter((usr) => usr.userId !== user.userId)
                                    .map((usr, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="text-gray-800">
                                                {usr.name} {usr.presenter && "✏️"}
                                            </span>
                                            <Button variant="outline" size="sm" onClick={() => togglePermission(usr)}>
                                                {usr.presenter ? "Revoke" : "Allow"}
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                            <div className="mt-6 text-right">
                                <Button onClick={() => setIsOpen(false)}>Close</Button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PresenterModal;
