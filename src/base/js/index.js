window.onload = function () {
  document.getElementById('face-capture').style.display = "block";
  const app = new Vue({
    el: "#app",
    data () {
      return {
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        },
        URL: null,
        streamIns: null, // 视频流
        showContainer: false, // 显示
        tracker: null,
        profile: [], // 轮廓
        scanTip: '人脸识别中...', // 提示文字
        imgUrl: '', // base64格式图片
        nativeShare: null,
        onOff: false
      }
    },
    mounted () {
      this.shar();
    },
    methods: {
      faceFn () {
        this.showContainer = true;
        this.playVideo()
      },
      shar () {
        this.nativeShare = new NativeShare();
        var shareData = {
          title: '分享test',
          desc: '分享test123分享test123分享test123分享test123分享test123分享test123分享test123',
          // 如果是微信该link的域名必须要在微信后台配置的安全域名之内的。
          link: 'https://www.baidu.com/',
          icon: 'https://www.baidu.com/img/flexible/logo/pc/result@2.png',
          // 不要过于依赖以下两个回调，很多浏览器是不支持的
          success: function () {
            alert('分享success')
          },
          fail: function () {
            alert('分享fail')
          }
        }
        this.nativeShare.setShareData(shareData)
      },
      shareFn (type) {
        try {
          this.nativeShare.call(type);
        } catch (err) {
          alert(err.message)
        }
      },
      // 访问用户媒体设备
      getUserMedia (constrains, success, error) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          //最新标准API
          navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error);
        } else if (navigator && navigator.webkitGetUserMedia) {
          //webkit内核浏览器
          navigator.webkitGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator && navigator.mozGetUserMedia) {
          //Firefox浏览器
          navagator.mozGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator && navigator.getUserMedia) {
          //旧版API
          navigator.getUserMedia(constrains).then(success).catch(error);
        } else {
          this.scanTip = "你的浏览器不支持访问用户媒体设备"
        }
      },
      success (stream) {
        this.streamIns = stream
        // webkit内核浏览器
        this.URL = window.URL || window.webkitURL
        if ("srcObject" in this.$refs.refVideo) {
          this.$refs.refVideo.srcObject = stream
        } else {
          this.$refs.refVideo.src = this.URL.createObjectURL(stream)
        }

        this.$refs.refVideo.onloadedmetadata = e => {
          this.$refs.refVideo.play()
          this.initTracker()
        }
      },
      error (e) {
        this.scanTip = "访问用户媒体失败" + e.name + "," + e.message
      },
      playVideo () {
        this.getUserMedia({
          video: {
            width: 1920,
            height: 1080,
            facingMode: "user"
          } /* 前置优先 */
        }, this.success, this.error)
      },
      // 人脸捕捉
      initTracker () {
        this.tracker = new tracking.ObjectTracker(['face']) // tracker实例
        this.tracker.setStepSize(1.7) // 设置步长
        this.tracker.on('track', this.handleTracked) // 绑定监听方法
        try {
          tracking.track('#video', this.tracker) // 开始追踪
        } catch (e) {
          this.scanTip = "访问用户媒体失败，请重试"
        }
      },
      // 追踪事件
      handleTracked (e) {
        if (this.onOff) return;
        this.profile = [];
        if (e.data.length === 0) {
          this.scanTip = '未检测到人脸'
        } else {
          e.data.forEach(this.plot);
          this.scanTip = '检测成功';
          this.onOff = true;
        }
      },
      // 绘制跟踪框
      plot ({
        x,
        y,
        width: w,
        height: h
      }) {
        // 创建框对象
        this.profile.push({
          width: w,
          height: h,
          left: x,
          top: y
        })
      },
      // 关闭并清理资源
      close () {
        this.showFailPop = false
        this.showContainer = false
        this.tracker && this.tracker.removeListener('track', this.handleTracked)
        this.tracker = null
        this.profile = []
        this.scanTip = '人脸识别中...';
        this.onOff = false;
        if (this.streamIns) {
          this.streamIns.enabled = false
          this.streamIns.getTracks()[0].stop()
          this.streamIns.getVideoTracks()[0].stop()
        }
        this.streamIns = null
      }
    }
  })
}