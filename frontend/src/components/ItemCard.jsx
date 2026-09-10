import { Link } from "react-router-dom";

export default function ItemCard({ item }) {
  return (
    <Link
      to={`/item/${item.id}`}
      className="group block bg-white rounded-sm border border-ink/10 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-[4/3] bg-ink/5 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-[10px] font-mono tracking-widest text-wax uppercase mb-1">
          {item.category}
        </p>
        <h3 className="font-display italic text-lg text-ink truncate">{item.title}</h3>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-[10px] text-ink/40 font-mono uppercase tracking-wide">
              Current Bid
            </p>
            <p className="text-lg font-bold text-felt font-mono">${item.currentBid}</p>
          </div>
          <span className="text-[10px] font-mono font-medium px-2 py-1 rounded-full bg-wax/10 text-wax">
            {item.timeLeft}
          </span>
        </div>
      </div>
    </Link>
  );
}
