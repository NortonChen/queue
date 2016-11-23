package norton.queue.util;

import java.util.concurrent.ArrayBlockingQueue;

/**
 * 学习基于数组的堵塞队列ArrayBlockingQueue
 * @author norton
 *
 */
public class TestArrayBlockingQueue {
	static private ArrayBlockingQueue<String> arrayQueue = new ArrayBlockingQueue<String>(10);
	
	

	/**
	 * 生产者线程类
	 * @author norton
	 *
	 */
	 static class ArrayQueueWriteThread implements Runnable {
        String name = null;
       
        ArrayQueueWriteThread(String name){
        	this.name = name;
        }
        
		public void run() {
			// TODO Auto-generated method stub
			String person = "person1";
			
			boolean addStatu =  arrayQueue.offer(person);
		   arrayQueue.add(person);
			
		}
		 
		 
	 }
	 
	 
	 /**
		 * 消费者线程类
		 * @author norton
		 *
		 */
	 static class ArrayQueueReadThread implements Runnable {
	        String name = null;
	       
	        ArrayQueueReadThread(String name){
	        	this.name = name;
	        }
	        
			public void run() {
				// TODO Auto-generated method stub
				String person=  arrayQueue.poll();
				while(person != null){
					System.out.println(person);
				}
			}
			 
			 
		 }
	 
	 
	 public static void main(String[] args) {
			// TODO Auto-generated method stub
		ArrayQueueReadThread arrayReadQueue = new  ArrayQueueReadThread("读用户");
		Thread thread1 = new Thread(arrayReadQueue);
		thread1.start();
		
	 }
}
