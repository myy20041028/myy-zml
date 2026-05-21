window.addEventListener('DOMContentLoaded', () => {

  // 相册按钮
  const pictureBtn = document.getElementById('goPictureBtn');
  if (pictureBtn) {
    pictureBtn.addEventListener('click', () => {
      window.location.href = '/tyust-myy/picture/picture.html';
    });
  }

  // ROS按钮
  const rosBtn = document.getElementById('goROSBtn');
  if (rosBtn) {
    rosBtn.addEventListener('click', () => {
      window.location.href = '/tyust-myy/ros/ros.html';
    });
  }

  // 聊天按钮
  const chatBtn = document.getElementById('goChatBtn');
  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      window.location.href = '/tyust-myy/chat/chat.html';
    });
  }

  // 音乐按钮
  const musicBtn = document.getElementById('goMUSICBtn'); 
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      window.location.href = '/tyust-myy/music/music.html';
    });
  }
 
});