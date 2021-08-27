import RoomModel from "../routes/rooms/schema.js";

export const createRooms = async (userId, followingId) => {
  const checkedRoom = await RoomModel.find({
    participants: { $all: [userId, followingId] },
  });
  // console.log(checkedRoom);
  if (checkedRoom.length === 0) {
    const room = await new RoomModel({
      participants: [{ userId: userId }, { userId: followingId }],
    });
    await room.save();
    return room;
  }
};
