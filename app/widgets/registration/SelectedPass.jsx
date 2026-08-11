import Link from "next/link";

export default function SelectedPass({ ticket }) {
  if (!ticket) {
    return null;
  }

  const isFree = Number(ticket.price) === 0;

  return (
    <div className="price-card">
      <div className="price-header">
        <h3>Your selected pass</h3>

        <Link href="/" className="btn change-pass">
          Change Pass
        </Link>
      </div>

      <div className="price-body">
        <p className="pass-name">{ticket.name}</p>
      </div>

      <div className="final-price-out">
        <div className="final-price">
          <span className="label">Final Price</span>

          <span className="amount" id="finalPrice">
            {isFree ? "FREE" : `${ticket.price} ${ticket.currency}`}
          </span>
        </div>
      </div>
    </div>
  );
}
