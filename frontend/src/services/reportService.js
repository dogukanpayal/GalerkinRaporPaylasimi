import { supabase } from "./supabaseClient";

export async function uploadReport(file, notes, userId) {
  console.log("Rapor yükleniyor, userId:", userId, "file:", file, "notes:", notes);
  if (!userId) throw new Error("Kullanıcı ID'si (userId) eksik!");
  const { data: fileData, error: fileError } = await supabase.storage
    .from("reports")
    .upload(`user_${userId}/${file.name}`, file);
  if (fileError) throw fileError;
  const { data: reportData, error: reportError } = await supabase
    .from("reports")
    .insert([
      {
        user_id: userId,
        file_path: fileData.path,
        notes: notes,
        status: "Submitted",
        date: new Date().toISOString().split("T")[0],
      },
    ])
    .select();
  if (reportError) throw reportError;
  return reportData[0];
}

export async function getMyReports(userId) {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllReports({ date, status, userId }) {
  let query = supabase
    .from("reports")
    .select("*, user:users(id, first_name, last_name)")
    .order("created_at", { ascending: false });
  if (date) query = query.eq("date", date);
  if (status) query = query.eq("status", status);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateReport(reportId, { notes }) {
  const { data, error } = await supabase
    .from("reports")
    .update({ notes })
    .eq("id", reportId)
    .select();
  if (error) throw error;
  return data && data[0];
}

export async function updateReportStatus(reportId, status) {
  const { data, error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId)
    .select();
  if (error) throw error;
  return data && data[0];
}

export async function deleteReport(reportId) {
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId);
  if (error) throw error;
} 