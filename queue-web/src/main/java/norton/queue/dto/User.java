package norton.queue.dto;

/**
 * 用户类
 * @author norton
 *
 */
public class User {
   private int id;
   private String name;
   private int idCard;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getIdCard() {
		return idCard;
	}
	public void setIdCard(int idCard) {
		this.idCard = idCard;
	}
	   
	
	public String toString(){
		return "id: " + id +"     "+"name: " + name;
	}
}
