import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMyReports } from "../services/reportService";

export default function ReportList({ refresh }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      getMyReports(user.id)
        .then(setReports)
        .catch(err => setError(err.message));
    }
  }, [user, refresh]);

  if (error) return <div>{error}</div>;
  if (!reports.length) return <div>Hiç rapor yok.</div>;

  return (
    <ul>
      {reports.map(report => (
        <li key={report.id}>
          <a
            href={`https://uliivtyxnrslopoanavm.supabase.co/storage/v1/object/public/reports/${report.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {report.file_path.split("/").pop()}
          </a>
          {" - "}
          {report.notes}
        </li>
      ))}
    </ul>
  );
} 