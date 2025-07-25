import { supabase } from "./supabaseClient";

export async function getAllReports() {
  try {
    console.log('Fetching all reports from Supabase...');
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }

    console.log('Fetched reports with user data:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getAllReports:', error);
    throw error;
  }
}

export async function uploadReport(file, notes, userId) {
  try {
    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    // Benzersiz dosya adı oluştur
    const uniqueName = `${Date.now()}_${file.name}`;
    const filePath = `user_${userId}/${uniqueName}`;

    // Dosyayı yükle
    const { error: fileError } = await supabase.storage
      .from("reports")
      .upload(filePath, file);

    if (fileError) {
      throw fileError;
    }

    // Rapor kaydını oluştur
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert([
        {
          user_id: userId,
          file_path: filePath,
          notes: notes || `${user.first_name} ${user.last_name}`,
          status: "Submitted",
          date: new Date().toISOString().split("T")[0],
          uploader_first_name: user.first_name,
          uploader_last_name: user.last_name
        }
      ])
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    return report;
  } catch (error) {
    console.error('Error in uploadReport:', error);
    throw error;
  }
}

export async function updateReportStatus(reportId, status) {
  try {
    const { data, error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    throw error;
  }
}

export async function deleteReport(reportId) {
  try {
    // Önce raporu al
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("file_path")
      .eq("id", reportId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Dosyayı storage'dan sil
    if (report?.file_path) {
      const { error: storageError } = await supabase.storage
        .from("reports")
        .remove([report.file_path]);

      if (storageError) {
        console.error('Error deleting file:', storageError);
      }
    }

    // Raporu veritabanından sil
    const { error: deleteError } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (deleteError) {
      throw deleteError;
    }
  } catch (error) {
    console.error('Error in deleteReport:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .order('first_name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
} 