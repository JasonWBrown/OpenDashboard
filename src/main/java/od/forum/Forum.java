package od.forum;

import java.util.List;

import od.model.OpenDashboardModel;

public class Forum extends OpenDashboardModel {

  private static final long serialVersionUID = 1L;

  private String title;
  private List<Topic> topics;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public List<Topic> getTopics() {
    return topics;
  }

  public void setTopics(List<Topic> topics) {
    this.topics = topics;
  }

}
