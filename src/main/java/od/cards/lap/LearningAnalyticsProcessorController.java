/**
 * 
 */
package od.cards.lap;

import java.util.Arrays;
import java.util.Collection;
import java.util.Map;

import od.cards.InvalidCardConfigurationException;
import od.model.Card;
import od.model.ContextMapping;
import od.repository.ContextMappingRepositoryInterface;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/**
 * @author ggilbert
 *
 */
@RestController
public class LearningAnalyticsProcessorController {
	private static final Logger log = LoggerFactory.getLogger(LearningAnalyticsProcessorController.class);
	
	@Autowired private ContextMappingRepositoryInterface contextMappingRepository;
	private RestTemplateFactoryInterface restTemplateFactory = new RestTemplateFactory();
	
	@Secured("ROLE_INSTRUCTOR")
	@RequestMapping(value = "/api/{contextMappingId}/db/{dashboardId}/lap/{cardId}/risk", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
	public String getLapResults(@PathVariable("contextMappingId") String contextMappingId,
			@PathVariable("dashboardId") String dashboardId,
			@PathVariable("cardId") String cardId) throws InvalidCardConfigurationException {

		if (log.isDebugEnabled()) {
			log.debug("contextMappingId "+contextMappingId);
			log.debug("dashboardId "+dashboardId);
			log.debug("cardId "+cardId);
		}

		ContextMapping cm = contextMappingRepository.findOne(contextMappingId);
		Card card = cm.findCard(cardId);
		Map<String, Object> config = card.getConfig();

		String baseUrl = null;
		String basicAuth = null;

		if (config != null && !config.isEmpty()) {
			baseUrl = (String)config.get("lap_url");
			basicAuth = (String)config.get("lap_key")+":"+(String)config.get("lap_secret");
		}
		else {
			throw new InvalidCardConfigurationException();
		}

		return exchange(baseUrl, cm.getContext(), null, basicAuth);
	}

	@Secured({"ROLE_INSTRUCTOR", "ROLE_STUDENT"})
	@RequestMapping(value = "/api/{contextMappingId}/db/{dashboardId}/openlrs/{cardId}/risk/{userId}", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
	public String getLapResultsForUser(@PathVariable("contextMappingId") String contextMappingId,
			@PathVariable("dashboardId") String dashboardId,
			@PathVariable("cardId") String cardId,
			@PathVariable("userId") String user) throws InvalidCardConfigurationException {

		if (log.isDebugEnabled()) {
			log.debug("contextMappingId "+contextMappingId);
			log.debug("dashboardId "+dashboardId);
			log.debug("cardId "+cardId);
			log.debug("userId "+user);
		}

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Collection<? extends GrantedAuthority> roles = auth.getAuthorities();
		if (roles != null && !roles.isEmpty()) {
			GrantedAuthority ga = roles.iterator().next();
			log.debug("ga: "+ga.getAuthority());
			if (ga != null && ga.getAuthority().equals("ROLE_STUDENT")) {
				User principal = (User)auth.getPrincipal();
				log.debug("principal: "+principal);
				String user_id = StringUtils.split(principal.getUsername(),":")[0];
				if (!user.equals(user_id)) {
					throw new IllegalAccessError("Unauthorized access attempt");
				}
			}
		}

		ContextMapping cm = contextMappingRepository.findOne(contextMappingId);
		Card card = cm.findCard(cardId);
		Map<String, Object> config = card.getConfig();

		String baseUrl = null;
		String basicAuth = null;

		if (config != null && !config.isEmpty()) {
			baseUrl = (String)config.get("lap_url");
			basicAuth = (String)config.get("lap_key")+":"+(String)config.get("lap_secret");
		}
		else {
			throw new InvalidCardConfigurationException();
		}

		return exchange(baseUrl, cm.getContext(), user, basicAuth);
	}

	private String exchange(String baseUrl, String context, String user, String basicAuth) {
		
		if (StringUtils.endsWith(baseUrl, "/")) {
			baseUrl = StringUtils.stripEnd(baseUrl, "/");
		}

		String expandedUrl = baseUrl + "/api/riskconfidence?course="+context;

		if (user != null) {
			expandedUrl = expandedUrl + "&user="+ user;
		}

		if (log.isDebugEnabled()) {
			log.debug(String.format("expandedUrl: %s",expandedUrl));
		}

		RestTemplate restTemplate = restTemplateFactory.createRestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		headers.set("Authorization", "Basic "+new String(Base64.encodeBase64(basicAuth.getBytes())));

		HttpEntity<String> entity = new HttpEntity<String>(headers);

		return restTemplate.exchange(expandedUrl, HttpMethod.GET, entity, String.class).getBody();
	}


	/*
	 * The code below was directly copied from OpenLRSCardController
	 * TODO consolidate
	 */
	
	public interface RestTemplateFactoryInterface {
		public RestTemplate createRestTemplate();
	}

	public class RestTemplateFactory implements RestTemplateFactoryInterface {
		@Override
		public RestTemplate createRestTemplate() {
			return new RestTemplate();
		}
	}

	public RestTemplateFactoryInterface getRestTemplateFactory() {
		return restTemplateFactory;
	}

	public void setRestTemplateFactory(
			RestTemplateFactoryInterface restTemplateFactory) {
		this.restTemplateFactory = restTemplateFactory;
	}

}
