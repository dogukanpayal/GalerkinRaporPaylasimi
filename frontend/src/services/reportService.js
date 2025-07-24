import { supabase } from "./supabaseClient";

export async function getAllReports(filters = {}) {
  console.log('Fetching all reports with filters:', filters);
  try {
    // Önce kullanıcıları çekelim
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    // Kullanıcıları ID'lerine göre map'leyelim
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Raporları çekelim
    let query = supabase
      .from('reports')
      .select('*');

    if (filters.date) {
      query = query.eq('date', filters.date);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    query = query.order('created_at', { ascending: false });

    const { data: reports, error: reportsError } = await query;

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      throw reportsError;
    }

    // Her rapora kullanıcı bilgisini ekleyelim
    const reportsWithUsers = reports.map(report => ({
      ...report,
      user: report.user_id ? userMap[report.user_id] : null
    }));

    console.log('Fetched reports:', reportsWithUsers);
    return reportsWithUsers;
  } catch (error) {
    console.error('Error in getAllReports:', error);
    throw error;
  }
}

export async function uploadReport(file, notes, userId) {
  console.log("Uploading report for user:", userId);
  
  try {
    // Kullanıcı bilgilerini kontrol et
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("User fetch error:", userError);
      throw userError;
    }

    if (!userData) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Benzersiz dosya adı oluştur
    const uniqueName = `${Date.now()}_${file.name}`;
    const filePath = `user_${userId}/${uniqueName}`;

    // Dosyayı yükle
    const { data: fileData, error: fileError } = await supabase.storage
      .from("reports")
      .upload(filePath, file);

    if (fileError) {
      console.error("File upload error:", fileError);
      throw fileError;
    }

    // Rapor kaydını oluştur
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .insert([
        {
          user_id: userId,
          file_path: filePath,
          notes: notes || `${userData.first_name} ${userData.last_name}`,
          status: "Submitted",
          date: new Date().toISOString().split("T")[0],
        }
      ])
      .select()
      .single();

    if (reportError) {
      console.error("Report creation error:", reportError);
      throw reportError;
    }

    return {
      ...reportData,
      user: userData
    };
  } catch (error) {
    console.error("Upload process error:", error);
    throw error;
  }
}

export async function updateReportStatus(reportId, status) {
  try {
    const { data, error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId)
      .select(`
        *,
        users!reports_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating report status:', error);
      throw error;
    }

    return {
      ...data,
      user: data.users
    };
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
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
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
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
      console.error("Error fetching report:", fetchError);
      throw fetchError;
    }

    // Dosyayı storage'dan sil
    if (report?.file_path) {
      const { error: storageError } = await supabase.storage
        .from("reports")
        .remove([report.file_path]);

      if (storageError) {
        console.error("Error deleting file:", storageError);
      }
    }

    // Raporu veritabanından sil
    const { error: deleteError } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (deleteError) {
      console.error("Error deleting report:", deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error("Delete operation failed:", error);
    throw error;
  }
} 