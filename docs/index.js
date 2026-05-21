window.addEventListener('DOMContentLoaded', () => {

  // 相册按钮
  const pictureBtn = document.getElementById('goPictureBtn');
  if (pictureBtn) {
    pictureBtn.addEventListener('click', () => {
      window.location.href = 'picture/picture.html';
    });
  }

  // ROS按钮
  const rosBtn = document.getElementById('goROSBtn');
  if (rosBtn) {
    rosBtn.addEventListener('click', () => {
      window.location.href = 'ros/ros.html';
    });
  }

  // 笔记按钮
  const noteBtn = document.getElementById('goNoteBtn');
  if (noteBtn) {
    noteBtn.addEventListener('click', () => {
      window.location.href = 'note/note.html';
    });
  }

  // 音乐按钮
  const musicBtn = document.getElementById('goMUSICBtn'); 
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      window.location.href = 'music/music.html';
    });
  }
 
});