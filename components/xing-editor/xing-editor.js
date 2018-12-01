// components/xing-editor.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //图片上传相关属性，参考wx.uploadFile
    imageUploadUrl: String,
    imageUploadName: String,
    imageUploadHeader: Object,
    imageUploadFormData: Object,
    imageUploadKeyChain: String, //例：'image.url'

    //是否在选择图片后立即上传
    // uploadImageWhenChoose: {
    //   type: Boolean,
    //   value: false,
    // },

    //输入内容
    nodes: Array,
    html: String,

    //内容输出格式，参考rich-text组件，默认为节点列表
    outputType: {
      type: String,
      value: 'html',
    },

    buttonBackgroundColor: {
      type: String,
      value: '#409EFF',
    },

    buttonTextColor: {
      type: String,
      value: '#fff',
    },

    title: {
      type:String,
      value: '',
    },
    propShow: {
      type: Array,
      value: [true],
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    windowHeight: 0,
    //
    nodeList: [],
    //元素：p的content，其他为undefined
    textBufferPool: [],
    aShow: [],//显示隐藏操作
  },

  pageLifetimes :{
    show() {
      let { text, index} = app.globalData.xing;
      if(text){
        this.addText();
      }
    }
  },

  attached: function () {
    //获得手机高度设置成组件的最少高度
    const { windowHeight } = wx.getSystemInfoSync();
    const aShow = this.properties.propShow;
    this.setData({
      windowHeight,
      aShow,
    })
    //判断用的是nodes还是html
    if (this.properties.nodes && this.properties.nodes.length > 0) {
      this.analysis(this.properties.nodes, aShow)
    } else if (this.properties.html) {
      const nodeList = this.HTMLtoNodeList();
      this.analysis(nodeList, aShow)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * attached生命周期的nodes和html的初始化
     */
    analysis(nodeList, aShow) {
      const textBufferPool = [];
      nodeList.forEach((node, index) => {
        aShow.push(false);
        if (node.name === 'p') {
          textBufferPool[index] = node.children[0].text;
        }
      })
      this.setData({
        textBufferPool,
        nodeList,
        aShow,
      })
    },
    /**
     * 每次修改nodeList
     */
    editorData(index, node) {
      let { nodeList, textBufferPool, aShow } = this.data
      const arr = [nodeList, textBufferPool, aShow];
      console.log(index);
      //是否添加
      if(node){
        //img和video的text为undefined
        let text = node.children && node.children[0].text || undefined;
        const element = [node, text, false]
        arr.forEach((val, i) => val.splice(index + 1, 0, element[i]))
        aShow = this.hide();
      } else {
        arr.forEach( val => val.splice(index, 1))
      }
      this.setData({
        nodeList,
        textBufferPool,
        aShow,
      })
    },
    
    hide() {
      return this.data.aShow.map( val => val = false);
    },

    tapHide(){
      this.setData({
        aShow: this.hide()
      })
    },

    editor(e) {
      let i = e.detail;
      const aShow = this.data.aShow;
      aShow[i] = !aShow[i];
      this.setData({
        aShow
      })
    },

    /**
     * 事件：进入文本页面
     */
    toText: function (e) {
      // this.writeTextToNode();
      let index = e.detail
      const textBufferPool = this.data.textBufferPool
      const xing = app.globalData.xing;
      xing.text = textBufferPool.length > index ? '' : textBufferPool[index];
      xing.index = index;
      wx.navigateTo({
        url: `/pages/editor-text/editor-text`
      });
    },

    addText(){
      const node = {
        name: 'p',
        attrs: {
          class: 'xing-p',
        },
        children: [{
          type: 'text',
          text: app.globalData.xing.text,
        }]
      }
      this.editorData(app.globalData.xing.index, node);
      app.clearXing();
    },

    /**
     * 事件：添加图片
     */
    addImage: function (e) {
      this.writeTextToNode();
      const index = e.detail;
      wx.chooseImage({
        success: res => {
          const tempFilePath = res.tempFilePaths[0];
          wx.getImageInfo({
            src: tempFilePath,
            success: res => {
              const node = {
                name: 'img',
                attrs: {
                  class: 'xing-img',
                  style: 'width: 100%',
                  src: tempFilePath,
                  /**
                   * 父组件传的参数是html或者nodes都是_height(被比例过的)
                   * onFinish提交出来的html也是_height(被比例过的)
                   */
                  _height: res.height / res.width,
                },
              }
              this.editorData(index, node);
            }
          })
        },
      })
    },

    /**
     * 事件：删除节点
     */
    deleteNode: function (e) {
      this.writeTextToNode();
      const index = e.currentTarget.dataset.index;
      this.editorData(index);
    },

    /**
     * 交换数据
     */
    exchange(e) {
      let dataset = e.currentTarget.dataset;
      let { index, up } = dataset;
      //根据up判断是否为向上交换
      let contrast = up ? index - 1 : index;
      let { nodeList, textBufferPool } = this.data;
      let i = 0;
      function fnSort(a, b){
        if (i++ == contrast) {
          return 1;
        }
        return 0;
      }
      nodeList.sort(fnSort)
      i = 0;
      textBufferPool.sort(fnSort)
      this.setData({
        nodeList,
        textBufferPool,
      })
    },

    /**
     * 事件：文本输入
     */
    // onTextareaInput: function (e) {
    //   const index = e.currentTarget.dataset.index;
    //   let textBufferPool = this.data.textBufferPool;
    //   textBufferPool[index] = e.detail.value;
    //   this.setData({
    //     textBufferPool,
    //   })
    // },

    /**
     * 事件：提交内容
     */
    onFinish: function (e) {
      wx.showLoading({
        title: '正在保存',
      })
      this.writeTextToNode();//只针对p标签
      this.handleOutput();
    },

    /**
     * 方法：HTML转义
     */
    htmlEncode: function (str) {
      var s = "";
      if (str.length == 0) return "";
      s = str.replace(/&/g, "&gt;");
      s = s.replace(/</g, "&lt;");
      s = s.replace(/>/g, "&gt;");
      s = s.replace(/ /g, "&nbsp;");
      s = s.replace(/\'/g, "&#39;");
      s = s.replace(/\"/g, "&quot;");
      s = s.replace(/\n/g, "<br>");
      return s;
    },

    /**
     * 方法：HTML转义
     */
    htmlDecode: function (str) {
      var s = "";
      if(str.length == 0) return "";
      s = str.replace(/&gt;/g, "&");
      s = s.replace(/&lt;/g, "<");
      s = s.replace(/&gt;/g, ">");
      s = s.replace(/&nbsp;/g, " ");
      s = s.replace(/&#39;/g, "\'");
      s = s.replace(/&quot;/g, "\"");
      s = s.replace(/<br>/g, "\n");
      return s;
    },

    /**
     * 方法：将缓冲池的文本写入节点
     */
    writeTextToNode: function (e) {
      const { nodeList, textBufferPool } = this.data;
      nodeList.forEach((node, index) => {
        if (node.name === 'p') {
          node.children[0].text = textBufferPool[index];
        }
      })
      this.setData({
        nodeList,
      })
    },

    /**
     * 方法：将HTML转为节点
     */
    HTMLtoNodeList: function () {
      let html = this.properties.html;
      let htmlNodeList = [];
      while (html.length > 0) {
        const endTag = html.match(/<\/[a-z0-9]+>/);
        console.log();
        if (!endTag) break;
        const htmlNode = html.substring(0, endTag.index + endTag[0].length);
        htmlNodeList.push(htmlNode);
        html = html.substring(endTag.index + endTag[0].length);
      }
      return htmlNodeList.map(htmlNode => {
        let node = {attrs: {}};
        const startTag = htmlNode.match(/<[^<>]+>/);
        const startTagStr = startTag[0].substring(1, startTag[0].length - 1).trim();
        node.name = startTagStr.split(/\s+/)[0];
        startTagStr.match(/[^\s]+="[^"]+"/g).forEach(attr => {
          const [name, value] = attr.split('=');
          node.attrs[name] = value.replace(/"/g, '');
        })
        if (node.name === 'p') {
          const endTag = htmlNode.match(/<\/[a-z0-9]+>/);
          const text = this.htmlDecode(htmlNode.substring(startTag.index + startTag[0].length, endTag.index).trim());
          node.children = [{
            text,
            type: 'text',
          }]
        }
        return node;
      })
    },

    /**
     * 方法：将节点转为HTML
     */
    nodeListToHTML: function () {
      return this.data.nodeList.map(node => `<${node.name} ${Object.keys(node.attrs).map(key => `${key}="${node.attrs[key]}"`).join(' ')}>${node.children ? this.htmlEncode(node.children[0].text) : ''}</${node.name}>`).join('');
    },

    /**
     * 方法：上传图片
     */
    uploadImage: function (node) {
      return new Promise(resolve => {
        let options = {
          filePath: node.attrs.src,
          url: this.properties.imageUploadUrl,
          name: this.properties.imageUploadName,
        }
        if (this.properties.imageUploadHeader) {
          options.header = this.properties.imageUploadHeader;
        }
        if (this.properties.imageUploadFormData) {
          options.formData = this.properties.imageUploadFormData;
        }
        options.success = res => {
          //解析对象属性
          const keyChain = this.properties.imageUploadKeyChain.split('.');
          console.log(keyChain);
          let url = JSON.parse(res.data);
          keyChain.forEach(key => {
            url = url[key];
          })
          node.attrs.src = url;
          node.attrs._uploaded = true;
          resolve();
        }
        wx.uploadFile(options);
      })
    },

    /**
     * 方法：处理节点，递归
     */
    handleOutput: function (index = 0) {
      let nodeList = this.data.nodeList;
      if (index >= nodeList.length) {
        wx.hideLoading();
        if (this.properties.outputType.toLowerCase() === 'array') {
          this.triggerEvent('finish', { content: this.data.nodeList });
        }
        if (this.properties.outputType.toLowerCase() === 'html') {
          this.triggerEvent('finish', { content: this.nodeListToHTML() });
        }
        return;
      }
      const node = nodeList[index];
      //_uploaded判断是否已经上传过
      if (node.name === 'img' && !node.attrs._uploaded) {
        this.uploadImage(node).then(() => {
          this.handleOutput(index + 1)
        });
      } else {
        this.handleOutput(index + 1);
      }
    },
  }
})
