import {debounce} from "./utils"
import BackTop from 'components/content/backTop/BackTop'

export const itemListenerMixin = {
  data(){
    return {
      itemImgListener:null,
      refresh:null
    }
  },
  mounted(){
    //1.图片加载完成的事件监听
    this.refresh = debounce(this.$refs.scroll.refresh,100)

    //对监听的事件进行保存
    this.itemImgListener = () => {
      this.refresh()
    }

    //监听item中图片加载完成
    this.$bus.$on('itemImageLoad',this.itemImgListener)
    // console.log('我是混入中的内容');
  }
}

export const backTopMixin = {
  components:{
    BackTop
  },
  data(){
    return {
      isShowBackTop: false
    }
  },
  methods:{
    backClick() {
      this.$refs.scroll.scrollTo(0, 0)
    },
    listenShowBackTop(position){
      this.isShowBackTop = (-position.y) > 1000
    }
  }
}
