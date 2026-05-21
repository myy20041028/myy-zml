import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// 你的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyACQTAC-VAsK2RDDycnnjNIOnUEHEeUu58",
  authDomain: "myy-zml.firebaseapp.com",
  projectId: "myy-zml",
  storageBucket: "myy-zml.firebasestorage.app",
  messagingSenderId: "996981037945",
  appId: "1:996981037945:web:b85af28aadb912c035eda8",
  measurementId: "G-6RGC9KGF89"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const notesList = document.getElementById("notesList");
const addNoteBtn = document.getElementById("addNoteBtn");
const newNote = document.getElementById("newNote");
const statusText = document.getElementById("statusText");

// 发布笔记
addNoteBtn.addEventListener("click", async () => {
  const content = newNote.value.trim();
  if(!content) return alert("笔记不能为空哦");

  statusText.innerText = "正在发布...💌";
  try {
    await addDoc(collection(db,"couple_notes"),{
      content,
      author:"你",
      created_at:serverTimestamp()
    });
    newNote.value="";
    statusText.innerText="✨ 已发布！";
  } catch(err) {
    statusText.innerText="❌ 发布失败";
    console.error(err);
  }
});

// 实时监听笔记
const q = query(collection(db,"couple_notes"),orderBy("created_at","desc"));
onSnapshot(q,snapshot=>{
  notesList.innerHTML="";
  snapshot.forEach(docSnap=>{
    const note=docSnap.data();
    const id=docSnap.id;
    const div=document.createElement("div");
    div.className="note-card";
    div.innerHTML=`
      <p>${note.content}</p>
      <small>🖊 ${note.author||"匿名"} • ${note.created_at?.toDate().toLocaleString()||""}</small>
      <button onclick="editNote('${id}','${note.content}')">✏️ 编辑</button>
      <button onclick="deleteNote('${id}')">🗑 删除</button>
    `;
    notesList.appendChild(div);
  });
});

// 编辑笔记
window.editNote=async(id,oldContent)=>{
  const newContent=prompt("修改笔记内容:",oldContent);
  if(!newContent) return;
  const noteRef=doc(db,"couple_notes",id);
  await updateDoc(noteRef,{content:newContent,updated_at:serverTimestamp()});
};

// 删除笔记
window.deleteNote=async(id)=>{
  if(!confirm("确定删除吗？")) return;
  const noteRef=doc(db,"couple_notes",id);
  await deleteDoc(noteRef);
};