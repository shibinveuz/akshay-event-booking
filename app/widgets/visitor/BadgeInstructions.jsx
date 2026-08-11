import { CircleAlert, Info } from "lucide-react";

const instructions = [
  {
    id: 1,
    title: "Check Your Email to Download Your Badge",
    paragraphs: [
      "You will receive a “Download Your Badge” email one week before the event, sent to your registered email address.",
      "Click the link provided in the email to download your badge as a PDF.",
    ],
  },
  {
    id: 2,
    title: "Print Your Badge at Home",
    paragraphs: [
      "Print the badge clearly on A4 paper, ensuring the QR code is fully visible. This printed badge will serve as your entry pass.",
    ],
  },
  {
    id: 3,
    title: "Bring Your Printed Badge to the Venue",
    paragraphs: ["Carry your badge with you on the event days to gain access."],
  },
];

export default function BadgeInstructions() {
  return (
    <div className="badge-instructions">
      <div className="instruction-header">
        <CircleAlert size={18} />
        HOW TO COLLECT YOUR BADGE
      </div>

      <p>Follow these simple steps to gain direct entry to the venue:</p>

      <div className="row">
        {instructions.map((instruction) => (
          <div className="col-lg-4" key={instruction.id}>
            <div className="instruction-item">
              <h6>
                {instruction.id}: {instruction.title}
              </h6>

              {instruction.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}

        <div className="col-lg-12">
          <div className="mt-4">
            <p>
              <Info size={17} /> Skip the queues and head straight into the
              exhibition halls with your printed badge—no waiting, no on-site
              registration needed.
            </p>
          </div>

          <div className="need-asistance">
            <h6>Need Assistance?</h6>

            <p>
              If you haven&apos;t received your badge email or need help, please
              contact our team at{" "}
              <span>
                <a href="mailto:example.com">example.com</a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
