import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../socket.js";
import { bidReceived, itemUpdated, itemCreatedRemote } from "../store/listingsSlice.js";

// Custom hook (same idea as Experiment 2's useCountdown): listens for the
// server's real-time events and turns each one into a Redux action. The
// components never touch the socket for data — they just read the store,
// which now changes by itself whenever anyone, anywhere, places a bid.
export default function useLiveUpdates() {
  const dispatch = useDispatch();

  useEffect(() => {
    const onBidPlaced = ({ bid, item }) => dispatch(bidReceived({ bid, item }));
    const onItemUpdated = (item) => dispatch(itemUpdated(item));
    const onItemCreated = (item) => dispatch(itemCreatedRemote(item));

    socket.on("bidPlaced", onBidPlaced);
    socket.on("itemUpdated", onItemUpdated);
    socket.on("itemCreated", onItemCreated);

    return () => {
      socket.off("bidPlaced", onBidPlaced);
      socket.off("itemUpdated", onItemUpdated);
      socket.off("itemCreated", onItemCreated);
    };
  }, [dispatch]);
}
