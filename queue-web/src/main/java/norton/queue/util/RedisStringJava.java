package norton.queue.util;

import norton.queue.dto.User;
import redis.clients.jedis.Jedis;

/**
 * java 操作redis String类型
 * @author norton
 *
 */
public class RedisStringJava extends BaseRedisJava implements RedisJava<String>{
    
	@Override
	public void set(String key, String value) {
		// TODO Auto-generated method stub
		jedis.set(key, value);
		
	}

	@Override
	public void remove(String key) {
		// TODO Auto-generated method stub
		jedis.del(key);
	}

	public static void main(String[] args) {
		//连接linux 服务器redis数据库
	
		RedisStringJava redisString = new RedisStringJava();
		User user1 = new User();
		user1.setId(1);
		user1.setName("norton");
		redisString.set("user:"+user1.getName(), user1.toString());
		
		//查看服务是否运行
		log.info("Service is running: " + jedis.ping());
	}

	
}
