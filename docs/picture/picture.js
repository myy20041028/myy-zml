// ==========================================
// 🔗 填入你自己在 Supabase 申请的凭证！
// ==========================================
const SUPABASE_URL = "https://yryyeyukjuiadtrqifjg.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_omkY-vXOVXABtqcdaUn7RA_KLnB0GX-"; 

// 初始化 Supabase 客户端
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const fileInput = document.getElementById("fileInput");
const statusText = document.getElementById("statusText");
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { data: storageData, error: storageError } = await _supabase.storage
      .from('album')
      .upload(fileName, file);

    if (storageError) throw storageError;

    const { data: urlData } = _supabase.storage
      .from('album')
      .getPublicUrl(fileName);

    const publicUrl = urlData.data ? urlData.data.publicUrl : urlData.publicUrl; 
    const isVideo = file.type.startsWith("video");

    const { error: dbError } = await _supabase
      .from('couple_album')
      .insert([
        { media_url: publicUrl, media_type: isVideo ? 'video' : 'image' }
      ]);

    if (dbError) throw dbError;

    statusText.innerText = "✨ 上传成功！两边都能看到啦！";
    fetchAlbum();
    
  } catch (err) {
    statusText.innerText = "❌ 上传失败，请检查配置";
    alert("上传出错了: " + err.message);
  }
});

/* ==========================================
   🔄 核心修改：分离照片与视频到不同的 Grid 中渲染
   ========================================== */
async function fetchAlbum() {
  try {
    const { data, error } = await _supabase
      .from('couple_album')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 抓取新的网格容器
    const imageGrid = document.getElementById("imageGrid");
    const videoGrid = document.getElementById("videoGrid");

    // 清空内容
    imageGrid.innerHTML = "";
    videoGrid.innerHTML = "";

    // 统计图片和视频各自的数量
    let imageCount = 0;
    let videoCount = 0;

    if (data && data.length > 0) {
      data.forEach(item => {
        let url = item.media_url;
        const type = item.media_type;
        const id = item.id;
        
        if (url && url.includes('/storage/v1/object/album/') && !url.includes('/storage/v1/object/public/album/')) {
          url = url.replace('/storage/v1/object/album/', '/storage/v1/object/public/album/');
        }

        const fileName = url.split('/').pop();
        const time = new Date(item.created_at).toLocaleDateString();

        // 制作共同的按钮和卡片尾部 HTML
        const cardInnerHtml = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <div style="display: flex; gap: 12px; font-size: 14px;">
              <a href="${url}" download="${fileName}" target="_blank" title="保存到本地" style="color: #10b981; text-decoration: none; cursor: pointer;">
                <i class="fas fa-download"></i> 保存
              </a>
              <span onclick="deletePhoto(${id}, '${fileName}')" title="删除这张" style="color: #ef4444; cursor: pointer;">
                <i class="fas fa-trash-alt"></i> 删除
              </span>
            </div>
            <div class="media-time">📅 ${time}</div>
          </div>
        `;

        const card = document.createElement("div");
        card.className = "media-card";

        // 💡 核心分流：根据类别分别塞入不同的网格
        if (type === "video") {
          videoCount++;
          card.innerHTML = `<video src="${url}" controls playsinline></video>${cardInnerHtml}`;
          videoGrid.appendChild(card);
        } else {
          imageCount++;
          card.innerHTML = `<img src="${url}" alt="情侣回忆">${cardInnerHtml}`;
          imageGrid.appendChild(card);
        }
      });
    }

    // 如果某一边是空的，打上温馨提示底色
    if (imageCount === 0) {
      imageGrid.innerHTML = `<p style="color:#a78bfa; padding:10px;">暂时还没有存入照片墙哦 🌸</p>`;
    }
    if (videoCount === 0) {
      videoGrid.innerHTML = `<p style="color:#a78bfa; padding:10px;">暂时还没有录入小视频哦 🎬</p>`;
    }

    // 动态刷新区块标题里的数量
    document.querySelector("#imageSection .section-title").innerHTML = `<i class="fas fa-images"></i> 📸 定格照片 (${imageCount} 张)`;
    document.querySelector("#videoSection .section-title").innerHTML = `<i class="fas fa-film"></i> 🎬 珍贵视频 (${videoCount} 个)`;

  } catch (err) {
    console.error("加载相册失败:", err);
  }
}

/* ==========================================
   ❌ 联动删除数据库和云网盘文件
   ========================================== */
window.deletePhoto = async function(id, fileName) {
  if (!confirm("越洋/美琳，确定要把这张珍贵的回忆删掉吗？🥺")) return;

  try {
    statusText.innerText = "正在拼命清理中... 🧹";

    const { error: storageError } = await _supabase.storage
      .from('album')
      .remove([fileName]);

    if (storageError) throw storageError;

    const { error: dbError } = await _supabase
      .from('couple_album')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    statusText.innerText = "✨ 已经安全删除啦！";
    fetchAlbum();

  } catch (err) {
    statusText.innerText = "❌ 删除失败";
    alert("删除出错了: " + err.message);
  }
}

// 返回主页按钮路径
backBtn.addEventListener("click", () => {
  window.location.href = '../index.html'; 
});