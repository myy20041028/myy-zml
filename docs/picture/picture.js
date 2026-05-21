// ==========================================
// 🔗 填入你自己在 Supabase 申请的凭证！
// ==========================================
const SUPABASE_URL = "https://yryyeyukjuiadtrqifjg.supabase.co"; // 已自动填好
const SUPABASE_ANON_KEY = "sb_publishable_omkY-vXOVXABtqcdaUn7RA_KLnB0GX-"; 

// 初始化 Supabase 客户端
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const fileInput = document.getElementById("fileInput");
const statusText = document.getElementById("statusText");
const photoGrid = document.getElementById("photoGrid");
const backBtn = document.getElementById("backBtn");

// 页面加载完成后，立刻去云端抓取相册列表
window.addEventListener("DOMContentLoaded", () => {
  fetchAlbum();
});

/* ==========================================
   📤 上传照片/视频到 Supabase Storage 桶和数据库
   ========================================== */
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  statusText.innerText = "正在向云端飞奔... 🚀";
  
  try {
    // 1. 生成独一无二的文件名，防止你和美琳上传同名文件时发生覆盖冲突
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // 2. 将照片/视频文件存入到你创建的名为 'album' 的 Storage 桶中
    const { data: storageData, error: storageError } = await _supabase.storage
      .from('album')
      .upload(fileName, file);

    if (storageError) throw storageError;

    // 3. 获取该文件在云端的公开绝对访问链接
    const { data: urlData } = _supabase.storage
      .from('album')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    const isVideo = file.type.startsWith("video");

    // 4. 将公开链接和类型插入到对应的数据表 couple_album 记录中
    const { error: dbError } = await _supabase
      .from('couple_album')
      .insert([
        { media_url: publicUrl, media_type: isVideo ? 'video' : 'image' }
      ]);

    if (dbError) throw dbError;

    statusText.innerText = "✨ 上传成功！两边都能看到啦！";
    
    // 5. 重新拉取最新的相册列表，实现实时刷新
    fetchAlbum();
    
  } catch (err) {
    statusText.innerText = "❌ 上传失败，请检查配置";
    alert("上传出错了: " + err.message);
  }
});

/* ==========================================
   🔄 从 Supabase 数据表中抓取相册流并渲染
   ========================================== */
async function fetchAlbum() {
  try {
    // 从 couple_album 表中选择数据，并按创建时间倒序排列（最新上传的在最前面）
    const { data, error } = await _supabase
      .from('couple_album')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 清空原有的照片墙内容
    photoGrid.innerHTML = "";

    if (!data || data.length === 0) {
      photoGrid.innerHTML = `<p style="color:#a78bfa; text-align:center; width:100%;">这里还没有照片，快传第一张吧 🌸</p>`;
      return;
    }

    // 循环遍历渲染每一个多媒体卡片
    data.forEach(item => {
      const url = item.media_url;
      const type = item.media_type;
      // 转化成容易看懂的本地日期格式
      const time = new Date(item.created_at).toLocaleDateString();

      const card = document.createElement("div");
      card.className = "media-card";

      if (type === "video") {
        card.innerHTML = `
          <video src="${url}" controls playsinline></video>
          <div class="media-time">📅 ${time}</div>
        `;
      } else {
        card.innerHTML = `
          <img src="${url}" alt="情侣回忆">
          <div class="media-time">📅 ${time}</div>
        `;
      }
      photoGrid.appendChild(card);
    });

  } catch (err) {
    console.error("加载相册失败:", err);
  }
}

// 返回主页按钮
backBtn.addEventListener("click", () => {
  window.location.href = '/tyust-myy/index.html'; 
});