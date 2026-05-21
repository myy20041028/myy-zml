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

// 模态框元素
const lightboxModal = document.getElementById("lightboxModal");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

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
    const originalName = file.name.split('.').slice(0, -1).join('.'); // 去除后缀的原名
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

    // 💡 改进：把文件的原本名称，记录在数据库字段中（可以使用数据库里的字段名，如没有专属字段，临时存入 custom_title 或利用现成的）
    // 为了不破坏你目前的 couple_album 表结构，我们直接利用 Supabase 允许的动态插入或确保更新
    const { error: dbError } = await _supabase
      .from('couple_album')
      .insert([
        { 
          media_url: publicUrl, 
          media_type: isVideo ? 'video' : 'image',
          custom_title: originalName // 记录原名
        }
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
   🔄 核心修改：渲染相册，并注入原名、修改、点击放大功能
   ========================================== */
async function fetchAlbum() {
  try {
    const { data, error } = await _supabase
      .from('couple_album')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const imageGrid = document.getElementById("imageGrid");
    const videoGrid = document.getElementById("videoGrid");

    if (!imageGrid || !videoGrid) return;

    imageGrid.innerHTML = "";
    videoGrid.innerHTML = "";

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
        
        // 💡 智能获取图片名称：优先读取修改后的 custom_title，如果没有，则抓取不带时间戳的随机后缀名
        let displayName = item.custom_title || "未命名记忆";

        // 操作控制栏 HTML
        const cardInnerHtml = `
          <div class="media-title-bar">
            <span id="title-${id}" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">✨ ${displayName}</span>
            <i class="fas fa-edit rename-btn" onclick="renameMedia(${id}, '${displayName}')" title="重命名"></i>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; border-top: 1px dashed #f1f5f9; padding-top: 6px;">
            <div style="display: flex; gap: 12px; font-size: 13px;">
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

        if (type === "video") {
          videoCount++;
          card.innerHTML = `<video src="${url}" controls playsinline></video>${cardInnerHtml}`;
          videoGrid.appendChild(card);
        } else {
          imageCount++;
          // 给 img 绑定点击全屏预览事件
          card.innerHTML = `<img src="${url}" alt="情侣回忆" onclick="openLightbox('${url}')">${cardInnerHtml}`;
          imageGrid.appendChild(card);
        }
      });
    }

    if (imageCount === 0) {
      imageGrid.innerHTML = `<p style="color:#a78bfa; padding:10px;">暂时还没有存入照片墙哦 🌸</p>`;
    }
    if (videoCount === 0) {
      videoGrid.innerHTML = `<p style="color:#a78bfa; padding:10px;">暂时还没有录入小视频哦 🎬</p>`;
    }

    const imgTitleNode = document.getElementById("imageTitle");
    const videoTitleNode = document.getElementById("videoTitle");
    if (imgTitleNode) imgTitleNode.innerHTML = `<i class="fas fa-images"></i> 📸 定格照片 (${imageCount} 张)`;
    if (videoTitleNode) videoTitleNode.innerHTML = `<i class="fas fa-film"></i> 🎬 珍贵视频 (${videoCount} 个)`;

  } catch (err) {
    console.error("加载相册失败:", err);
  }
}

/* ==========================================
   ✨ 新增功能一：在线重命名名称
   ========================================== */
window.renameMedia = async function(id, currentName) {
  const newName = prompt("给这段美好的回忆起一个新名字吧：", currentName);
  if (newName === null) return; // 点击了取消
  if (!newName.trim()) {
    alert("名字不能为空哦！");
    return;
  }

  try {
    statusText.innerText = "正在同步云端别名... ✍️";

    // 更新到 Supabase 对应行的 custom_title 字段中
    const { error } = await _supabase
      .from('couple_album')
      .update({ custom_title: newName.trim() })
      .eq('id', id);

    if (error) throw error;

    statusText.innerText = "✨ 改名成功啦！";
    fetchAlbum(); // 重新刷新界面
  } catch (err) {
    statusText.innerText = "❌ 改名失败";
    alert("重命名出错了，可能你的表里还没有创建 custom_title 字段: " + err.message);
  }
}

/* ==========================================
   ✨ 新增功能二：点击大图查看 (灯箱效果)
   ========================================== */
window.openLightbox = function(url) {
  lightboxImg.src = url;
  lightboxModal.classList.add("active");
}

lightboxClose.addEventListener("click", () => {
  lightboxModal.classList.remove("active");
});

// 点击黑色背景也可以关闭大图
lightboxModal.addEventListener("click", (e) => {
  if (e.target === lightboxModal) {
    lightboxModal.classList.remove("active");
  }
});


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