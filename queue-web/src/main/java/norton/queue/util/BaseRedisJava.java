package norton.queue.util;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import redis.clients.jedis.Jedis;

/**
 * 连接redis数据库
 * @author norton
 *
 */
public class BaseRedisJava {
	
	public static final Log log = LogFactory.getLog(BaseRedisJava.class);
	
	/**
	 * redis 服务器ip地址
	 */
    public static final String redisServiceIp = "192.168.188.132";
    public static final int redisServicePort = 6379;
	public static Jedis jedis= connRedis();
    /**
     * 连接redis数据库
     * @return jedis 实例
     */
    public static Jedis connRedis(){
		Jedis jedis = new Jedis(redisServiceIp,redisServicePort);
		log.info("Connection to service successful");
		return jedis;
	}
    
    public static void closeRedis(){
    	 if(jedis.isConnected()){
    		 jedis.close();
    	 }
    	
    }
    


}
