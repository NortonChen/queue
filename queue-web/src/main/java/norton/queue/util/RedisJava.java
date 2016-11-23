package norton.queue.util;
/**
 * 提供基本的添加删除redis中数据的功能
 * @author norton
 *
 */
public interface RedisJava<T> {
     /**
      * 添加数据
      */
	  public void set(String key,T value);
	  
	  /**
	   * 删除数据
	   */
      public void remove(String key);
}
