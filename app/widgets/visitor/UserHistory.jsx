import Image from "next/image";

function getStatusClass(status) {
  switch (String(status).toLowerCase()) {
    case "success":
      return "badge-approved-us-hist";

    case "pending":
      return "badge-pending-us-hist";

    case "failed":
      return "badge-faild-us-hist";

    default:
      return "";
  }
}

export default function UserHistory({ history = [] }) {
  return (
    <div className="tab-content" id="user-history">
      <div className="user-history-tabs">
        <div
          className="tab-content-inner tab-cntnt-no-pad"
          id="userHistoryTabsContent"
        >
          <div className="tab-pane fade show active">
            <div className="table-main-div">
              <table className="badge-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>User</th>
                    <th>Activity</th>
                    <th>Description</th>
                    <th>Performed By</th>
                    <th>Status</th>
                    <th>IP Address</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.date}</td>

                      <td>
                        <div className="user">
                          <Image
                            src={item.image}
                            width={40}
                            height={40}
                            alt={item.user}
                          />

                          <span>{item.user}</span>
                        </div>
                      </td>

                      <td>{item.activity}</td>

                      <td>{item.description}</td>

                      <td>
                        {item.performedBy}

                        {item.performedByType && (
                          <span className="primary-user">
                            {item.performedByType}
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge-status ${getStatusClass(
                            item.status,
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>{item.ipAddress}</td>
                    </tr>
                  ))}

                  {history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No user history is available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mobile-table-card-wrapper">
              <div className="row">
                {history.map((item) => (
                  <div className="col-lg-4" key={item.id}>
                    <div className="mobile-table-card">
                      <div className="mobile-card-profile">
                        <div className="d-flex align-items-center gap-3">
                          <Image
                            src={item.image}
                            width={50}
                            height={50}
                            alt={item.user}
                          />

                          <div className="mobile-card-header">
                            <h5>{item.user}</h5>

                            <h6>{item.description}</h6>
                          </div>
                        </div>
                      </div>

                      <div className="details-grid">
                        <HistoryItem label="Activity" value={item.activity} />

                        <HistoryItem label="Status" value={item.status} />

                        <HistoryItem
                          label="Performed By"
                          value={item.performedBy}
                        />

                        <HistoryItem
                          label="IP Address"
                          value={item.ipAddress}
                        />

                        <HistoryItem label="Date & Time" value={item.date} />
                      </div>
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="col-12 text-center py-4">
                    No user history is available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ label, value }) {
  return (
    <div className="detail-item">
      <div className="detail-label">{label}</div>

      <div className="detail-value">{value}</div>
    </div>
  );
}
