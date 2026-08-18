"use client";

import Link from "next/link";
import { useCurrency } from "@/app/context/CurrencyContext";

export default function SelectedPass({ ticket }) {
  const { currency } = useCurrency();

  if (!ticket) {
    return null;
  }

  const isFree = Number(ticket.price) === 0 || ticket.price === "FREE";
  const cleanPrice = typeof ticket.price === "string"
    ? ticket.price.replace(/\s*(NGN|USD)$/i, "").trim()
    : ticket.price;

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
            {isFree ? "FREE" : `${cleanPrice} ${currency}`}
          </span>
        </div>
      </div>
    </div>
  );
}
