  // 1️⃣ 通过 CDN 引入 Firebase 模块
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } 
    from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

  // 2️⃣ Firebase 配置
  const firebaseConfig = {
    apiKey: "AIzaSyACQTAC-VAsK2RDDycnnjNIOnUEHEeUu58",
    authDomain: "myy-zml.firebaseapp.com",
    projectId: "myy-zml",
    storageBucket: "myy-zml.firebasestorage.app",
    messagingSenderId: "996981037945",
    appId: "1:996981037945:web:b85af28aadb912c035eda8",
    measurementId: "G-6RGC9KGF89"
  };

  // 3️⃣ 初始化
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 4️⃣ DOM 元素
  const notesList = document.getElementById("notesList");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const newNote = document.getElementById("newNote");
  const statusText = document.getElementById("statusText");

  // 5️⃣ 发布笔记
  addNoteBtn.addEventListener("click", async () => {
    const content = newNote.value.trim();
    if (!content) return alert("笔记不能为空哦");

    statusText.innerText = "正在发布...💌";
    try {
      await addDoc(collection(db, "couple_notes"), {
        content,
        author: "你",
        created_at: serverTimestamp()
      });
      newNote.value = "";
      statusText.innerText = "✨ 已发布！";
    } catch (err) {
      statusText.innerText = "❌ 发布失败";
      console.error(err);
    }
  });

  // 6️⃣ 实时监听笔记
  const q = query(collection(db, "couple_notes"), orderBy("created_at", "desc"));
  onSnapshot(q, snapshot => {
    notesList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const note = docSnap.data();
      const id = docSnap.id;

      // 使用 addEventListener 避免 onclick 的引号问题
      const div = document.createElement("div");
      div.className = "note-card";

      const p = document.createElement("p");
      p.innerText = note.content;

      const small = document.createElement("small");
      small.innerText = `🖊 ${note.author || "匿名"} • ${note.created_at ? note.created_at.toDate().toLocaleString() : ""}`;

      const editBtn = document.createElement("button");
      editBtn.innerText = "✏️ 编辑";
      editBtn.addEventListener("click", () => editNote(id, note.content));

      const delBtn = document.createElement("button");
      delBtn.innerText = "🗑 删除";
      delBtn.addEventListener("click", () => deleteNote(id));

      div.appendChild(p);
      div.appendChild(small);
      div.appendChild(editBtn);
      div.appendChild(delBtn);

      notesList.appendChild(div);
    });
  });

  // 7️⃣ 编辑笔记
  window.editNote = async (id, oldContent) => {
    const newContent = prompt("修改笔记内容:", oldContent);
    if (!newContent) return;
    const noteRef = doc(db, "couple_notes", id);
    await updateDoc(noteRef, { content: newContent, updated_at: serverTimestamp() });
  };

  // 8️⃣ 删除笔记
  window.deleteNote = async (id) => {
    if (!confirm("确定删除吗？")) return;
    const noteRef = doc(db, "couple_notes", id);
    await deleteDoc(noteRef);
  };

// 返回主页按钮路径
backBtn.addEventListener("click", () => {
  window.location.href = '../index.html'; 
});